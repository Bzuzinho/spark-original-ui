<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMembroRequest;
use App\Http\Requests\UpdateMemberRequest;
use App\Models\User;
use App\Models\UserType;
use App\Models\AgeGroup;
use App\Models\CostCenter;
use App\Models\MonthlyFee;
use App\Models\DadosFinanceiros;
use App\Models\Invoice;
use App\Models\Movement;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class MembrosController extends Controller
{
    public function index(): Response
    {
        $users = User::with(['userTypes', 'ageGroup', 'encarregados', 'educandos'])->get();
        $userTypes = UserType::where('ativo', true)->get();
        $ageGroups = AgeGroup::all();

        // Calculate statistics
        $totalMembros = $users->count();
        $membrosAtivos = $users->where('estado', 'ativo')->count();
        $membrosInativos = $users->where('estado', 'inativo')->count();
        
        $totalAtletas = $users->filter(function ($user) {
            return is_array($user->tipo_membro) && in_array('atleta', $user->tipo_membro);
        })->count();
        
        $atletasAtivos = $users->filter(function ($user) {
            return is_array($user->tipo_membro) && 
                   in_array('atleta', $user->tipo_membro) && 
                   $user->ativo_desportivo == true;
        })->count();
        
        $encarregados = $users->filter(function ($user) {
            return is_array($user->tipo_membro) && in_array('encarregado_educacao', $user->tipo_membro);
        })->count();
        
        $treinadores = $users->filter(function ($user) {
            return is_array($user->tipo_membro) && in_array('treinador', $user->tipo_membro);
        })->count();

        $novosUltimos30Dias = $users->filter(function ($user) {
            return $user->created_at && $user->created_at->isAfter(now()->subDays(30));
        })->count();

        // Count members by type
        $tipoMembrosStats = [];
        foreach ($userTypes as $tipo) {
            $count = $users->filter(function ($user) use ($tipo) {
                return is_array($user->tipo_membro) && in_array($tipo->id, $user->tipo_membro);
            })->count();
            
            if ($count > 0) {
                $tipoMembrosStats[] = [
                    'tipo' => $tipo->nome,
                    'count' => $count
                ];
            }
        }

        // Count athletes by age group
        $escaloesStats = [];
        foreach ($ageGroups as $escalao) {
            $count = $users->filter(function ($user) use ($escalao) {
                return is_array($user->tipo_membro) && 
                       in_array('atleta', $user->tipo_membro) && 
                       $user->escalao_id == $escalao->id;
            })->count();
            
            if ($count > 0) {
                $escaloesStats[] = [
                    'escalao' => $escalao->nome,
                    'count' => $count
                ];
            }
        }

        return Inertia::render('Membros/Index', [
            'members' => $users->values(),
            'userTypes' => $userTypes,
            'ageGroups' => $ageGroups,
            'stats' => [
                'totalMembros' => $totalMembros,
                'membrosAtivos' => $membrosAtivos,
                'membrosInativos' => $membrosInativos,
                'totalAtletas' => $totalAtletas,
                'atletasAtivos' => $atletasAtivos,
                'encarregados' => $encarregados,
                'treinadores' => $treinadores,
                'novosUltimos30Dias' => $novosUltimos30Dias,
                'atestadosACaducar' => 0, // TODO: implement when health data is available
            ],
            'tipoMembrosStats' => $tipoMembrosStats,
            'escaloesStats' => $escaloesStats,
        ]);
    }

    public function create(): Response
    {
        $allUsers = User::with(['userTypes', 'ageGroup'])->get();
        $userTypes = UserType::where('ativo', true)->get();
        $ageGroups = AgeGroup::all();
        $nextMemberNumber = $this->generateMemberNumber();
        
        return Inertia::render('Membros/Create', [
            'allUsers' => $allUsers,
            'userTypes' => $userTypes,
            'ageGroups' => $ageGroups,
            'nextMemberNumber' => $nextMemberNumber,
            'monthlyFees' => MonthlyFee::where('ativo', true)
                ->select('id', 'designacao', 'valor', 'ativo')
                ->get()
                ->map(function ($fee) {
                    $fee->valor = (float) $fee->valor;
                    return $fee;
                }),
            'costCenters' => CostCenter::where('ativo', true)
                ->select('id', 'nome', 'ativo')
                ->get(),
        ]);
    }

    public function store(StoreMembroRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();
            
            // Auto-generate numero_socio if not provided
            if (empty($data['numero_socio'])) {
                $data['numero_socio'] = $this->generateMemberNumber();
            }

            // Ensure core auth fields exist
            if (empty($data['name'])) {
                $data['name'] = $data['nome_completo'] ?? 'Membro';
            }

            if (empty($data['email'])) {
                $baseEmail = $data['email_utilizador'] ?? null;
                $data['email'] = $baseEmail ?: ('member+' . Str::uuid() . '@local.test');
            }
            
            // Auto-calculate menor field (age < 18)
            if (isset($data['data_nascimento'])) {
                $birthDate = Carbon::parse($data['data_nascimento']);
                $data['menor'] = $birthDate->age < 18;
            }
            
            // Hash password
            $data['password'] = Hash::make($data['password'] ?? 'password123');
            
            // Handle file uploads
            if (isset($data['foto_perfil']) && $this->isBase64($data['foto_perfil'])) {
                $data['foto_perfil'] = $this->storeBase64Image($data['foto_perfil'], 'members/photos');
            } elseif (array_key_exists('foto_perfil', $data)) {
                unset($data['foto_perfil']);
            }
            
            if (isset($data['cartao_federacao']) && $this->isBase64($data['cartao_federacao'])) {
                $data['cartao_federacao'] = $this->storeFile($data['cartao_federacao'], 'members/federation_cards');
            }
            
            if (isset($data['arquivo_rgpd']) && $this->isBase64($data['arquivo_rgpd'])) {
                $data['arquivo_rgpd'] = $this->storeFile($data['arquivo_rgpd'], 'members/gdpr');
            }
            
            if (isset($data['arquivo_consentimento']) && $this->isBase64($data['arquivo_consentimento'])) {
                $data['arquivo_consentimento'] = $this->storeFile($data['arquivo_consentimento'], 'members/consent');
            }
            
            if (isset($data['arquivo_afiliacao']) && $this->isBase64($data['arquivo_afiliacao'])) {
                $data['arquivo_afiliacao'] = $this->storeFile($data['arquivo_afiliacao'], 'members/affiliation');
            }
            
            if (isset($data['declaracao_transporte']) && $this->isBase64($data['declaracao_transporte'])) {
                $data['declaracao_transporte'] = $this->storeFile($data['declaracao_transporte'], 'members/transport');
            }
            
            $member = User::create($data);

            if (array_key_exists('tipo_mensalidade', $data) || array_key_exists('conta_corrente_manual', $data)) {
                $financeData = DadosFinanceiros::firstOrNew(['user_id' => $member->id]);
                if (array_key_exists('tipo_mensalidade', $data)) {
                    $financeData->mensalidade_id = $data['tipo_mensalidade'];
                }
                if (array_key_exists('conta_corrente_manual', $data)) {
                    $financeData->conta_corrente_manual = $data['conta_corrente_manual'] ?? 0;
                }
                $financeData->save();
            }
            
            // Sync relationships
            if (isset($data['user_types'])) {
                $member->userTypes()->sync($data['user_types']);
            }
            
            // Sync guardian relationship (with reciprocal update)
            if (array_key_exists('encarregado_educacao', $data) && is_array($data['encarregado_educacao'])) {
                $this->syncGuardianRelations($member, $data['encarregado_educacao']);
            }

            // Sync educandos relationship (with reciprocal update)
            if (array_key_exists('educandos', $data) && is_array($data['educandos'])) {
                $this->syncEducandoRelations($member, $data['educandos']);
            }

            if (array_key_exists('centro_custo', $data) && is_array($data['centro_custo'])) {
                $centros = $data['centro_custo'];
                $syncData = [];

                foreach ($centros as $center) {
                    if (is_array($center)) {
                        $centerId = $center['id'] ?? null;
                        $peso = isset($center['peso']) ? (float) $center['peso'] : 1;
                    } else {
                        $centerId = $center;
                        $peso = 1;
                    }

                    if ($centerId) {
                        $syncData[$centerId] = ['peso' => $peso];
                    }
                }

                $member->centrosCusto()->sync($syncData);
                $member->centro_custo = array_values(array_keys($syncData));
                $member->save();
            }

            return redirect()->route('membros.index')
                ->with('success', 'Membro criado com sucesso!');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Erro ao criar membro: ' . $e->getMessage());
        }
    }

    public function show(User $member): Response
    {
        $member->load([
            'userTypes',
            'ageGroup',
            'encarregados',
            'educandos',
            'eventsCreated',
            'eventAttendances',
            'documents',
            'relationships.relatedUser',
            'dadosFinanceiros',
            'centrosCusto',
        ]);

        $memberData = $member->toArray();
        if ($member->data_nascimento) {
            $memberData['data_nascimento'] = $member->data_nascimento->format('Y-m-d');
        }
        $allUsers = User::select(
            'id',
            'nome_completo',
            'numero_socio',
            'tipo_membro',
            'foto_perfil',
            'menor',
            'data_nascimento'
        )->get();

        $faturas = Invoice::where('user_id', $member->id)
            ->orderBy('data_emissao', 'desc')
            ->get()
            ->map(function ($fatura) {
                $fatura->valor_total = (float) $fatura->valor_total;
                return $fatura;
            });

        $movimentos = Movement::where('user_id', $member->id)
            ->orderBy('data_emissao', 'desc')
            ->get()
            ->map(function ($movimento) {
                $movimento->valor_total = (float) $movimento->valor_total;
                return $movimento;
            });

        $contaCorrente = (float) $faturas
            ->filter(function ($fatura) {
                if (!in_array($fatura->estado_pagamento, ['pendente', 'vencido'], true)) {
                    return false;
                }

                if (!$fatura->data_fatura) {
                    return true;
                }

                return $fatura->data_fatura->startOfDay()->lte(now()->startOfDay());
            })
            ->sum('valor_total');

        $contaCorrenteManual = $member->dadosFinanceiros?->conta_corrente_manual ?? 0;
        $memberData['conta_corrente'] = $contaCorrente + (float) $contaCorrenteManual;
        $memberData['conta_corrente_manual'] = (float) $contaCorrenteManual;
        $memberData['tipo_mensalidade'] = $member->dadosFinanceiros?->mensalidade_id ?? $member->tipo_mensalidade;
        $legacyCentros = collect($member->centro_custo ?? [])
            ->map(function ($center) {
                if (is_array($center) && isset($center['id'])) {
                    return $center['id'];
                }
                return $center;
            })
            ->filter()
            ->values();

        if ($member->centrosCusto->isNotEmpty()) {
            $memberData['centro_custo'] = $member->centrosCusto->pluck('id')->values();
            $memberData['centro_custo_pesos'] = $member->centrosCusto->map(function ($center) {
                return [
                    'id' => $center->id,
                    'peso' => (float) ($center->pivot->peso ?? 1),
                ];
            })->values();
        } else {
            $memberData['centro_custo'] = $legacyCentros;
            $memberData['centro_custo_pesos'] = $legacyCentros->map(function ($id) {
                return [
                    'id' => $id,
                    'peso' => 1.0,
                ];
            })->values();
        }

        return Inertia::render('Membros/Show', [
            'member' => $memberData,
            'allUsers' => $allUsers,
            'userTypes' => UserType::where('ativo', true)->get(),
            'ageGroups' => AgeGroup::all(),
            'faturas' => $faturas,
            'movimentos' => $movimentos,
            'monthlyFees' => MonthlyFee::where('ativo', true)
                ->select('id', 'designacao', 'valor', 'ativo')
                ->get()
                ->map(function ($fee) {
                    $fee->valor = (float) $fee->valor;
                    return $fee;
                }),
            'costCenters' => CostCenter::where('ativo', true)
                ->select('id', 'nome', 'ativo')
                ->get(),
        ]);
    }

    public function edit(User $member): Response
    {
        if ($member->data_nascimento) {
            $member->data_nascimento = $member->data_nascimento->format('Y-m-d');
        }
        $member->load(['dadosFinanceiros', 'centrosCusto']);
        $member->tipo_mensalidade = $member->dadosFinanceiros?->mensalidade_id ?? $member->tipo_mensalidade;
        $legacyCentros = collect($member->centro_custo ?? [])
            ->map(function ($center) {
                if (is_array($center) && isset($center['id'])) {
                    return $center['id'];
                }
                return $center;
            })
            ->filter()
            ->values();

        if ($member->centrosCusto->isNotEmpty()) {
            $member->centro_custo = $member->centrosCusto->pluck('id')->values();
            $member->centro_custo_pesos = $member->centrosCusto->map(function ($center) {
                return [
                    'id' => $center->id,
                    'peso' => (float) ($center->pivot->peso ?? 1),
                ];
            })->values();
        } else {
            $member->centro_custo = $legacyCentros;
            $member->centro_custo_pesos = $legacyCentros->map(function ($id) {
                return [
                    'id' => $id,
                    'peso' => 1.0,
                ];
            })->values();
        }
        return Inertia::render('Membros/Edit', [
            'member' => $member->load(['userTypes', 'ageGroup', 'encarregados', 'educandos', 'dadosFinanceiros', 'centrosCusto']),
            'userTypes' => UserType::where('ativo', true)->get(),
            'ageGroups' => AgeGroup::all(),
            'guardians' => User::whereJsonContains('tipo_membro', 'encarregado_educacao')
                ->where('id', '!=', $member->id)
                ->get(),
            'monthlyFees' => MonthlyFee::where('ativo', true)
                ->select('id', 'designacao', 'valor', 'ativo')
                ->get()
                ->map(function ($fee) {
                    $fee->valor = (float) $fee->valor;
                    return $fee;
                }),
            'costCenters' => CostCenter::where('ativo', true)
                ->select('id', 'nome', 'ativo')
                ->get(),
        ]);
    }

    public function update(UpdateMemberRequest $request, User $member): RedirectResponse
    {
        try {
            $data = $request->validated();
            
            // Auto-calculate menor field if data_nascimento changes
            if (isset($data['data_nascimento'])) {
                $birthDate = Carbon::parse($data['data_nascimento']);
                $data['menor'] = $birthDate->age < 18;
            }
            
            // Hash password only if provided
            if (isset($data['password']) && $data['password']) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }
            
            // Handle file uploads
            if (isset($data['foto_perfil']) && $this->isBase64($data['foto_perfil'])) {
                $this->deleteFile($member->foto_perfil);
                $data['foto_perfil'] = $this->storeBase64Image($data['foto_perfil'], 'members/photos');
            } elseif (array_key_exists('foto_perfil', $data)) {
                unset($data['foto_perfil']);
            }
            
            if (isset($data['cartao_federacao']) && $this->isBase64($data['cartao_federacao'])) {
                $this->deleteFile($member->cartao_federacao);
                $data['cartao_federacao'] = $this->storeFile($data['cartao_federacao'], 'members/federation_cards');
            }
            
            if (isset($data['arquivo_rgpd']) && $this->isBase64($data['arquivo_rgpd'])) {
                $this->deleteFile($member->arquivo_rgpd);
                $data['arquivo_rgpd'] = $this->storeFile($data['arquivo_rgpd'], 'members/gdpr');
            }
            
            if (isset($data['arquivo_consentimento']) && $this->isBase64($data['arquivo_consentimento'])) {
                $this->deleteFile($member->arquivo_consentimento);
                $data['arquivo_consentimento'] = $this->storeFile($data['arquivo_consentimento'], 'members/consent');
            }
            
            if (isset($data['arquivo_afiliacao']) && $this->isBase64($data['arquivo_afiliacao'])) {
                $this->deleteFile($member->arquivo_afiliacao);
                $data['arquivo_afiliacao'] = $this->storeFile($data['arquivo_afiliacao'], 'members/affiliation');
            }
            
            if (isset($data['declaracao_transporte']) && $this->isBase64($data['declaracao_transporte'])) {
                $this->deleteFile($member->declaracao_transporte);
                $data['declaracao_transporte'] = $this->storeFile($data['declaracao_transporte'], 'members/transport');
            }
            
            $member->update($data);

            if (array_key_exists('tipo_mensalidade', $data) || array_key_exists('conta_corrente_manual', $data)) {
                $financeData = DadosFinanceiros::firstOrNew(['user_id' => $member->id]);
                if (array_key_exists('tipo_mensalidade', $data)) {
                    $financeData->mensalidade_id = $data['tipo_mensalidade'];
                }
                if (array_key_exists('conta_corrente_manual', $data)) {
                    $financeData->conta_corrente_manual = $data['conta_corrente_manual'] ?? 0;
                }
                $financeData->save();
            }

            if (array_key_exists('centro_custo', $data) && is_array($data['centro_custo'])) {
                $centros = $data['centro_custo'];
                $syncData = [];

                foreach ($centros as $center) {
                    if (is_array($center)) {
                        $centerId = $center['id'] ?? null;
                        $peso = isset($center['peso']) ? (float) $center['peso'] : 1;
                    } else {
                        $centerId = $center;
                        $peso = 1;
                    }

                    if ($centerId) {
                        $syncData[$centerId] = ['peso' => $peso];
                    }
                }

                $member->centrosCusto()->sync($syncData);
                $member->centro_custo = array_values(array_keys($syncData));
                $member->save();
            }
            
            // Sync relationships
            if (isset($data['user_types'])) {
                $member->userTypes()->sync($data['user_types']);
            }
            
            // Sync guardian relationship (with reciprocal update)
            if (array_key_exists('encarregado_educacao', $data) && is_array($data['encarregado_educacao'])) {
                $this->syncGuardianRelations($member, $data['encarregado_educacao']);
            }

            // Sync educandos relationship (with reciprocal update)
            if (array_key_exists('educandos', $data) && is_array($data['educandos'])) {
                $this->syncEducandoRelations($member, $data['educandos']);
            }

            return redirect()->route('membros.index')
                ->with('success', 'Membro atualizado com sucesso!');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Erro ao atualizar membro: ' . $e->getMessage());
        }
    }

    public function destroy(User $member): RedirectResponse
    {
        try {
            // Detach from all guardian/educando relationships
            $member->encarregados()->detach();
            $member->educandos()->detach();
            
            // Delete all associated files
            $this->deleteFile($member->foto_perfil);
            $this->deleteFile($member->cartao_federacao);
            $this->deleteFile($member->arquivo_rgpd);
            $this->deleteFile($member->arquivo_consentimento);
            $this->deleteFile($member->arquivo_afiliacao);
            $this->deleteFile($member->declaracao_transporte);
            
            $member->delete();

            return redirect()->route('membros.index')
                ->with('success', 'Membro eliminado com sucesso!');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Erro ao eliminar membro: ' . $e->getMessage());
        }
    }
    
    // Helper methods

    /**
     * Normalize relation ids to a unique string array.
     */
    private function normalizeRelationIds(?array $ids): array
    {
        $normalized = array_map('strval', $ids ?? []);
        $normalized = array_filter($normalized, fn ($id) => $id !== '');
        return array_values(array_unique($normalized));
    }

    /**
     * Sync guardians and mirror the relationship on each guardian.
     */
    private function syncGuardianRelations(User $member, array $guardianIds): void
    {
        $guardianIds = $this->normalizeRelationIds($guardianIds);
        $currentGuardianIds = $this->normalizeRelationIds(
            $member->encarregados()->pluck('users.id')->all()
        );

        $member->encarregados()->sync($guardianIds);

        $added = array_diff($guardianIds, $currentGuardianIds);
        $removed = array_diff($currentGuardianIds, $guardianIds);

        if (!empty($added) || !empty($removed)) {
            $affectedIds = array_values(array_unique(array_merge($added, $removed)));
            $guardians = User::whereIn('id', $affectedIds)->get()->keyBy('id');

            foreach ($added as $guardianId) {
                if ($guardians->has($guardianId)) {
                    $guardians[$guardianId]->educandos()->syncWithoutDetaching([$member->id]);
                }
            }

            foreach ($removed as $guardianId) {
                if ($guardians->has($guardianId)) {
                    $guardians[$guardianId]->educandos()->detach($member->id);
                }
            }
        }
    }

    /**
     * Sync educandos and mirror the relationship on each educando.
     */
    private function syncEducandoRelations(User $member, array $educandoIds): void
    {
        $educandoIds = $this->normalizeRelationIds($educandoIds);
        $currentEducandoIds = $this->normalizeRelationIds(
            $member->educandos()->pluck('users.id')->all()
        );

        $member->educandos()->sync($educandoIds);

        $added = array_diff($educandoIds, $currentEducandoIds);
        $removed = array_diff($currentEducandoIds, $educandoIds);

        if (!empty($added) || !empty($removed)) {
            $affectedIds = array_values(array_unique(array_merge($added, $removed)));
            $educandos = User::whereIn('id', $affectedIds)->get()->keyBy('id');

            foreach ($added as $educandoId) {
                if ($educandos->has($educandoId)) {
                    $educandos[$educandoId]->encarregados()->syncWithoutDetaching([$member->id]);
                }
            }

            foreach ($removed as $educandoId) {
                if ($educandos->has($educandoId)) {
                    $educandos[$educandoId]->encarregados()->detach($member->id);
                }
            }
        }
    }
    
    /**
     * Check if string is base64 encoded data
     */
    private function isBase64(string $data): bool
    {
        // Check if it starts with a data URI scheme and has base64 encoding
        return preg_match('/^data:[\w\/\-\.+]+;base64,/', $data) === 1;
    }
    
    /**
     * Store base64 encoded image to storage
     */
    private function storeBase64Image(string $base64, string $path): string
    {
        // Extract the base64 data
        if (preg_match('/^data:image\/([a-zA-Z0-9\+\-\.]+);base64,/', $base64, $type)) {
            $base64 = substr($base64, strpos($base64, ',') + 1);
            $extension = strtolower($type[1]);
            if ($extension === 'svg+xml') {
                $extension = 'svg';
            }
            
            // Validate image type
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
            if (!in_array($extension, $allowedExtensions)) {
                throw new \InvalidArgumentException('Tipo de imagem inválido. Permitidos: ' . implode(', ', $allowedExtensions));
            }
        } else {
            throw new \InvalidArgumentException('Formato de imagem inválido.');
        }
        
        $data = base64_decode($base64, true);
        if ($data === false) {
            throw new \InvalidArgumentException('Falha ao decodificar imagem base64.');
        }
        
        // Validate file size (max 5MB)
        if (strlen($data) > 5 * 1024 * 1024) {
            throw new \InvalidArgumentException('Tamanho da imagem excede 5MB.');
        }
        
        $filename = Str::uuid() . '.' . $extension;
        $filePath = $path . '/' . $filename;
        
        Storage::disk('public')->put($filePath, $data);
        
        return $filePath;
    }
    
    /**
     * Store file (base64 or path) to storage
     */
    private function storeFile(string $base64OrPath, string $path): string
    {
        // Extract the base64 data
        if (preg_match('/^data:([^;]+);base64,/', $base64OrPath, $type)) {
            $base64 = substr($base64OrPath, strpos($base64OrPath, ',') + 1);
            $mimeType = $type[1];
            
            // Determine extension from mime type
            $mimeToExt = [
                'application/pdf' => 'pdf',
                'image/jpeg' => 'jpg',
                'image/jpg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/webp' => 'webp',
                'application/msword' => 'doc',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            ];
            
            if (!isset($mimeToExt[$mimeType])) {
                throw new \InvalidArgumentException('Tipo de arquivo não suportado: ' . $mimeType);
            }
            
            $extension = $mimeToExt[$mimeType];
        } else {
            throw new \InvalidArgumentException('Formato de arquivo inválido.');
        }
        
        $data = base64_decode($base64, true);
        if ($data === false) {
            throw new \InvalidArgumentException('Falha ao decodificar arquivo base64.');
        }
        
        // Validate file size (max 10MB)
        if (strlen($data) > 10 * 1024 * 1024) {
            throw new \InvalidArgumentException('Tamanho do arquivo excede 10MB.');
        }
        
        $filename = Str::uuid() . '.' . $extension;
        $filePath = $path . '/' . $filename;
        
        Storage::disk('public')->put($filePath, $data);
        
        return $filePath;
    }
    
    /**
     * Delete file from storage if exists
     */
    private function deleteFile(?string $path): void
    {
        if (!$path) {
            return;
        }

        $normalizedPath = $path;
        if (str_starts_with($normalizedPath, 'http')) {
            $parsed = parse_url($normalizedPath, PHP_URL_PATH);
            $normalizedPath = $parsed ? $parsed : $normalizedPath;
        }
        if (str_starts_with($normalizedPath, '/storage/')) {
            $normalizedPath = substr($normalizedPath, strlen('/storage/'));
        }

        if (Storage::disk('public')->exists($normalizedPath)) {
            Storage::disk('public')->delete($normalizedPath);
        }
    }
    
    /**
     * Generate sequential member number
     */
    private function generateMemberNumber(): string
    {
        $currentYear = now()->format('Y');
        $yearPrefix = $currentYear . '-';

        $yearNumbers = User::whereNotNull('numero_socio')
            ->where('numero_socio', 'like', $yearPrefix . '%')
            ->pluck('numero_socio');

        $maxYearSuffix = 0;
        foreach ($yearNumbers as $numero) {
            if (preg_match('/^' . $currentYear . '-(\d+)$/', $numero, $matches)) {
                $maxYearSuffix = max($maxYearSuffix, (int) $matches[1]);
            }
        }

        if ($yearNumbers->isNotEmpty()) {
            $nextSuffix = $maxYearSuffix + 1;
            return $currentYear . '-' . str_pad((string) $nextSuffix, 4, '0', STR_PAD_LEFT);
        }

        $lastNumeric = User::whereNotNull('numero_socio')
            ->where('numero_socio', 'not like', '%-%')
            ->orderByRaw('CAST(numero_socio as INTEGER) desc')
            ->first();

        $nextNumber = $lastNumeric && $lastNumeric->numero_socio
            ? ((int) $lastNumeric->numero_socio) + 1
            : 0;

        return $currentYear . '-' . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
