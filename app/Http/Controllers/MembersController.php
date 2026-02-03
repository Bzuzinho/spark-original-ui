<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateMemberRequest;
use App\Models\User;
use App\Models\UserType;
use App\Models\AgeGroup;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class MembersController extends Controller
{
    private const FIELD_MAP = [
        'email_utilizador' => 'user_email',
        'sexo' => 'gender',
        'perfil' => 'profile',
        'estado' => 'status',
        'morada' => 'address',
        'codigo_postal' => 'postal_code',
        'localidade' => 'city',
        'contacto' => 'contact',
        'contacto_telefonico' => 'phone_contact',
        'telemovel' => 'mobile',
        'ocupacao' => 'occupation',
        'empresa' => 'company',
        'escola' => 'school',
        'numero_irmaos' => 'siblings_count',
        'email_secundario' => 'secondary_email',
        'tipo_mensalidade' => 'membership_fee_type',
        'centro_custo' => 'cost_centers',
        'num_federacao' => 'federation_number',
        'numero_pmb' => 'pmb_number',
        'data_inscricao' => 'registration_date',
        'inscricao' => 'registration_file',
        'escalao' => 'age_groups',
        'data_atestado_medico' => 'medical_certificate_date',
        'arquivo_atestado_medico' => 'medical_certificate_files',
        'informacoes_medicas' => 'medical_information',
        'ativo_desportivo' => 'sports_active',
        'data_rgpd' => 'gdpr_date',
        'rgpd' => 'gdpr_consent',
        'data_consentimento' => 'consent_date',
        'data_afiliacao' => 'affiliation_date',
        'declaracao_de_transporte' => 'transport_declaration',
        'numero_utente' => 'health_number',
        'nacionalidade' => 'nationality',
        'estado_civil' => 'marital_status',
        'cc' => 'id_card_number',
        'numero_socio' => 'member_number',
    ];
    
    public function index(): Response
    {
        return Inertia::render('Members/Index', [
            'members' => User::with(['userTypes', 'ageGroup', 'encarregados', 'educandos'])
                ->latest()
                ->get(),
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Members/Create', [
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
            'guardians' => User::whereJsonContains('member_type', 'encarregado_educacao')->get(),
        ]);
    }

    public function store(StoreMemberRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();
            
            // Map Portuguese fields to English column names first
            foreach (self::FIELD_MAP as $portuguese => $english) {
                if (isset($data[$portuguese])) {
                    $data[$english] = $data[$portuguese];
                }
            }
            
            // Auto-generate member_number if not provided
            if (empty($data['member_number'])) {
                $data['member_number'] = $this->generateMemberNumber();
            }
            
            // Auto-calculate menor field (age < 18)
            if (isset($data['data_nascimento'])) {
                $birthDate = Carbon::parse($data['data_nascimento']);
                $data['menor'] = $birthDate->age < 18;
                $data['birth_date'] = $data['data_nascimento'];
            }
            
            // Hash password
            $data['password'] = Hash::make($data['password'] ?? 'password123');
            
            // Handle file uploads
            if (isset($data['foto_perfil']) && $this->isBase64($data['foto_perfil'])) {
                $data['profile_photo'] = $this->storeBase64Image($data['foto_perfil'], 'members/photos');
            }
            
            if (isset($data['cartao_federacao']) && $this->isBase64($data['cartao_federacao'])) {
                $data['federation_card'] = $this->storeFile($data['cartao_federacao'], 'members/federation_cards');
            }
            
            if (isset($data['arquivo_rgpd']) && $this->isBase64($data['arquivo_rgpd'])) {
                $data['gdpr_file'] = $this->storeFile($data['arquivo_rgpd'], 'members/gdpr');
            }
            
            if (isset($data['arquivo_consentimento']) && $this->isBase64($data['arquivo_consentimento'])) {
                $data['consent_file'] = $this->storeFile($data['arquivo_consentimento'], 'members/consent');
            }
            
            if (isset($data['arquivo_afiliacao']) && $this->isBase64($data['arquivo_afiliacao'])) {
                $data['affiliation_file'] = $this->storeFile($data['arquivo_afiliacao'], 'members/affiliation');
            }
            
            if (isset($data['declaracao_transporte']) && $this->isBase64($data['declaracao_transporte'])) {
                $data['transport_declaration_file'] = $this->storeFile($data['declaracao_transporte'], 'members/transport');
            }
            
            $member = User::create($data);
            
            // Sync relationships
            if (isset($data['user_types'])) {
                $member->userTypes()->sync($data['user_types']);
            }
            
            // Sync guardian relationship
            if (isset($data['encarregado_educacao']) && is_array($data['encarregado_educacao'])) {
                $member->encarregados()->sync($data['encarregado_educacao']);
            }

            return redirect()->route('members.index')
                ->with('success', 'Membro criado com sucesso!');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Erro ao criar membro: ' . $e->getMessage());
        }
    }

    public function show(User $member): Response
    {
        return Inertia::render('Members/Show', [
            'member' => $member->load([
                'userTypes',
                'ageGroup',
                'encarregados',
                'educandos',
                'eventsCreated',
                'eventAttendances',
                'documents',
                'relationships.relatedUser',
            ]),
            'allUsers' => User::select('id', 'full_name', 'member_number', 'member_type')->get(),
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
        ]);
    }

    public function edit(User $member): Response
    {
        return Inertia::render('Members/Edit', [
            'member' => $member->load(['userTypes', 'ageGroup', 'encarregados', 'educandos']),
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
            'guardians' => User::whereJsonContains('member_type', 'encarregado_educacao')
                ->where('id', '!=', $member->id)
                ->get(),
        ]);
    }

    public function update(UpdateMemberRequest $request, User $member): RedirectResponse
    {
        try {
            $data = $request->validated();
            
            // Map Portuguese fields to English column names first
            foreach (self::FIELD_MAP as $portuguese => $english) {
                if (isset($data[$portuguese])) {
                    $data[$english] = $data[$portuguese];
                }
            }
            
            // Auto-calculate menor field if data_nascimento changes
            if (isset($data['data_nascimento'])) {
                $birthDate = Carbon::parse($data['data_nascimento']);
                $data['menor'] = $birthDate->age < 18;
                $data['birth_date'] = $data['data_nascimento'];
            }
            
            // Hash password only if provided
            if (isset($data['password']) && $data['password']) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }
            
            // Handle file uploads
            if (isset($data['foto_perfil']) && $this->isBase64($data['foto_perfil'])) {
                $this->deleteFile($member->profile_photo);
                $data['profile_photo'] = $this->storeBase64Image($data['foto_perfil'], 'members/photos');
            }
            
            if (isset($data['cartao_federacao']) && $this->isBase64($data['cartao_federacao'])) {
                $this->deleteFile($member->federation_card);
                $data['federation_card'] = $this->storeFile($data['cartao_federacao'], 'members/federation_cards');
            }
            
            if (isset($data['arquivo_rgpd']) && $this->isBase64($data['arquivo_rgpd'])) {
                $this->deleteFile($member->gdpr_file);
                $data['gdpr_file'] = $this->storeFile($data['arquivo_rgpd'], 'members/gdpr');
            }
            
            if (isset($data['arquivo_consentimento']) && $this->isBase64($data['arquivo_consentimento'])) {
                $this->deleteFile($member->consent_file);
                $data['consent_file'] = $this->storeFile($data['arquivo_consentimento'], 'members/consent');
            }
            
            if (isset($data['arquivo_afiliacao']) && $this->isBase64($data['arquivo_afiliacao'])) {
                $this->deleteFile($member->affiliation_file);
                $data['affiliation_file'] = $this->storeFile($data['arquivo_afiliacao'], 'members/affiliation');
            }
            
            if (isset($data['declaracao_transporte']) && $this->isBase64($data['declaracao_transporte'])) {
                $this->deleteFile($member->transport_declaration_file);
                $data['transport_declaration_file'] = $this->storeFile($data['declaracao_transporte'], 'members/transport');
            }
            
            $member->update($data);
            
            // Sync relationships
            if (isset($data['user_types'])) {
                $member->userTypes()->sync($data['user_types']);
            }
            
            // Sync guardian relationship
            if (isset($data['encarregado_educacao']) && is_array($data['encarregado_educacao'])) {
                $member->encarregados()->sync($data['encarregado_educacao']);
            }

            return redirect()->route('members.index')
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
            $this->deleteFile($member->profile_photo);
            $this->deleteFile($member->federation_card);
            $this->deleteFile($member->gdpr_file);
            $this->deleteFile($member->consent_file);
            $this->deleteFile($member->affiliation_file);
            $this->deleteFile($member->transport_declaration_file);
            
            $member->delete();

            return redirect()->route('members.index')
                ->with('success', 'Membro eliminado com sucesso!');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Erro ao eliminar membro: ' . $e->getMessage());
        }
    }
    
    // Helper methods
    
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
        if (preg_match('/^data:image\/(\w+);base64,/', $base64, $type)) {
            $base64 = substr($base64, strpos($base64, ',') + 1);
            $extension = strtolower($type[1]);
            
            // Validate image type
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
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
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
    
    /**
     * Generate sequential member number
     */
    private function generateMemberNumber(): string
    {
        $lastMember = User::whereNotNull('member_number')
            ->where('member_number', 'REGEXP', '^[0-9]+$')
            ->orderBy('member_number', 'desc')
            ->first();
        
        if ($lastMember && $lastMember->member_number) {
            $lastNumber = (int) $lastMember->member_number;
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }
        
        // Use 4 digits to support up to 9999 members
        return str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
