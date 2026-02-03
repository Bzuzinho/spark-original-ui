<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserType;
use App\Models\AgeGroup;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MembrosController extends Controller
{
    public function index(): Response
    {
        try {
            $members = User::select(
                'id',
                'name',
                'email',
                'numero_socio',
                'nome_completo',
                'estado',
                'tipo_membro',
                'data_nascimento',
                'telefone',
                'foto_perfil',
                'created_at'
            )
            ->latest()
            ->get();

            return Inertia::render('Membros/Index', [
                'members' => $members,
                'userTypes' => UserType::where('active', true)->get(),
                'ageGroups' => AgeGroup::all(),
            ]);
        } catch (\Exception $e) {
            Log::error('MembrosController@index error: ' . $e->getMessage());
            
            return Inertia::render('Membros/Index', [
                'members' => [],
                'userTypes' => [],
                'ageGroups' => [],
            ]);
        }
    }

    public function create(): Response
    {
        return Inertia::render('Membros/Create', [
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
            'guardians' => [],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        try {
            // Validate input
            $validated = $request->validate([
                'nome_completo' => 'required|string|max:255',
                'data_nascimento' => 'required|date',
                'email_utilizador' => 'nullable|email|unique:users,email_utilizador',
                'email' => 'nullable|email',
                'password' => 'nullable|string|min:8',
                'numero_socio' => 'nullable|string|max:50',
                'sexo' => 'nullable|in:masculino,feminino',
                'menor' => 'boolean',
                'tipo_membro' => 'required|array|min:1',
                'estado' => 'required|in:ativo,inativo,suspenso',
                'nif' => 'nullable|string|max:20',
                'morada' => 'nullable|string',
                'codigo_postal' => 'nullable|string|max:10',
                'localidade' => 'nullable|string|max:100',
                'telefone' => 'nullable|string|max:20',
                'telemovel' => 'nullable|string|max:20',
                'contacto_emergencia_nome' => 'nullable|string|max:255',
                'contacto_emergencia_telefone' => 'nullable|string|max:20',
                'perfil' => 'nullable|in:admin,encarregado,atleta,staff,user',
            ]);

            // ✅ Map form data to Portuguese column names
            $userData = [
                // Required fields
                'nome_completo' => $validated['nome_completo'],
                'data_nascimento' => $validated['data_nascimento'],
                'tipo_membro' => json_encode($validated['tipo_membro']), // Store as JSON
                'estado' => $validated['estado'],
                'menor' => $validated['menor'] ?? false,
                
                // Optional basic fields
                'numero_socio' => $validated['numero_socio'] ?? null,
                'sexo' => $validated['sexo'] ?? null,
                'nif' => $validated['nif'] ?? null,
                
                // Contact fields
                'morada' => $validated['morada'] ?? null,
                'codigo_postal' => $validated['codigo_postal'] ?? null,
                'localidade' => $validated['localidade'] ?? null,
                'telefone' => $validated['telefone'] ?? null,
                'telemovel' => $validated['telemovel'] ?? null,
                
                // Emergency contact
                'contacto_emergencia_nome' => $validated['contacto_emergencia_nome'] ?? null,
                'contacto_emergencia_telefone' => $validated['contacto_emergencia_telefone'] ?? null,
                
                // Platform access (OPTIONAL - can be null)
                'email_utilizador' => $validated['email_utilizador'] ?? null,
                'email' => $validated['email'] ?? $validated['email_utilizador'] ?? null,
                'perfil' => $validated['perfil'] ?? 'user',
                
                // Laravel required fields
                'name' => $validated['nome_completo'], // Duplicate for Laravel Auth compatibility
            ];

            // ✅ Only set password if email_utilizador is provided (platform access)
            if (!empty($validated['email_utilizador'])) {
                if (!empty($validated['password'])) {
                    $userData['password'] = Hash::make($validated['password']);
                } else {
                    // Generate random password if creating platform user without password
                    $userData['password'] = Hash::make(Str::random(16));
                }
            } else {
                // No platform access - set dummy password (user won't be able to login)
                $userData['password'] = Hash::make(Str::random(32));
            }

            // Create user
            $member = User::create($userData);

            Log::info('Member created successfully', ['id' => $member->id, 'nome' => $member->nome_completo]);

            return redirect()->route('membros.index')
                ->with('success', 'Membro criado com sucesso!');
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Validation failed', ['errors' => $e->errors()]);
            
            return redirect()->back()
                ->withInput()
                ->withErrors($e->errors());
                
        } catch (\Exception $e) {
            Log::error('Error creating member: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'Erro ao criar membro: ' . $e->getMessage());
        }
    }

    public function show(User $membro): Response
    {
        try {
            $membro->load(['userTypes', 'ageGroup']);
            
            try {
                $membro->load(['encarregados', 'educandos']);
            } catch (\Exception $e) {
                Log::warning('Could not load relationships: ' . $e->getMessage());
            }
            
            $memberData = [
                'id' => $membro->id,
                'numero_socio' => $membro->numero_socio,
                'nome_completo' => $membro->nome_completo ?? $membro->name,
                'email' => $membro->email,
                'email_utilizador' => $membro->email_utilizador,
                'foto_perfil' => $membro->foto_perfil,
                'estado' => $membro->estado,
                'tipo_membro' => $membro->tipo_membro ?? [],
                'data_nascimento' => $membro->data_nascimento,
                'menor' => $membro->menor,
                'sexo' => $membro->sexo,
                'nif' => $membro->nif,
                'morada' => $membro->morada,
                'codigo_postal' => $membro->codigo_postal,
                'localidade' => $membro->localidade,
                'telefone' => $membro->telefone,
                'telemovel' => $membro->telemovel,
                'contacto_emergencia_nome' => $membro->contacto_emergencia_nome,
                'contacto_emergencia_telefone' => $membro->contacto_emergencia_telefone,
                'perfil' => $membro->perfil,
                'rgpd' => $membro->rgpd,
                'consentimento' => $membro->consentimento,
                'afiliacao' => $membro->afiliacao,
                'declaracao_de_transporte' => $membro->declaracao_de_transporte,
                'tipo_mensalidade' => $membro->tipo_mensalidade,
                'conta_corrente' => $membro->conta_corrente,
                'num_federacao' => $membro->num_federacao,
                'cartao_federacao' => $membro->cartao_federacao,
                'numero_pmb' => $membro->numero_pmb,
                'data_inscricao' => $membro->data_inscricao,
                'data_atestado_medico' => $membro->data_atestado_medico,
                'informacoes_medicas' => $membro->informacoes_medicas,
                'ativo_desportivo' => $membro->ativo_desportivo,
                'user_types' => $membro->userTypes ?? [],
                'age_group' => $membro->ageGroup ?? null,
                'encarregados' => $membro->encarregados ?? [],
                'educandos' => $membro->educandos ?? [],
                'created_at' => $membro->created_at,
                'updated_at' => $membro->updated_at,
            ];
            
            $allUsers = User::select('id', 'numero_socio', 'nome_completo', 'name', 'tipo_membro')
                ->where('id', '!=', $membro->id)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'numero_socio' => $user->numero_socio,
                        'nome_completo' => $user->nome_completo ?? $user->name,
                        'tipo_membro' => $user->tipo_membro ?? [],
                    ];
                });

            return Inertia::render('Membros/Show', [
                'member' => $memberData,
                'allUsers' => $allUsers,
                'userTypes' => UserType::where('active', true)->get(),
                'ageGroups' => AgeGroup::all(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error loading member details: ' . $e->getMessage());
            
            return redirect()->route('membros.index')
                ->with('error', 'Erro ao carregar detalhes do membro');
        }
    }

    public function edit(User $membro): Response
    {
        try {
            $membro->load(['userTypes', 'ageGroup']);
            
            try {
                $membro->load(['encarregados', 'educandos']);
            } catch (\Exception $e) {
                Log::warning('Could not load relationships for edit: ' . $e->getMessage());
            }
            
            try {
                $guardians = User::whereRaw("tipo_membro::jsonb @> ?", [json_encode('encarregado_educacao')])
                    ->where('id', '!=', $membro->id)
                    ->select('id', 'numero_socio', 'nome_completo', 'name')
                    ->get()
                    ->map(function ($user) {
                        return [
                            'id' => $user->id,
                            'numero_socio' => $user->numero_socio,
                            'nome_completo' => $user->nome_completo ?? $user->name,
                        ];
                    });
            } catch (\Exception $e) {
                Log::warning('Error loading guardians for edit: ' . $e->getMessage());
                $guardians = collect([]);
            }

            return Inertia::render('Membros/Edit', [
                'member' => $membro,
                'userTypes' => UserType::where('active', true)->get(),
                'ageGroups' => AgeGroup::all(),
                'guardians' => $guardians,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error loading member for edit: ' . $e->getMessage());
            
            return redirect()->route('membros.index')
                ->with('error', 'Erro ao carregar formulário de edição');
        }
    }

    public function update(Request $request, User $membro): RedirectResponse
{
    try {
        $validated = $request->validate([
            'numero_socio' => 'nullable|string|max:50',
            'nome_completo' => 'required|string|max:255',
            'data_nascimento' => 'nullable|date',
            'sexo' => 'nullable|in:masculino,feminino',
            'menor' => 'boolean',
            'tipo_membro' => 'required|array|min:1',
            'estado' => 'required|in:ativo,inativo,suspenso',
            'nif' => 'nullable|string|max:20',
            'morada' => 'nullable|string',
            'codigo_postal' => 'nullable|string|max:10',
            'localidade' => 'nullable|string|max:100',
            'telefone' => 'nullable|string|max:20',
            'telemovel' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'contacto_emergencia_nome' => 'nullable|string|max:255',
            'contacto_emergencia_telefone' => 'nullable|string|max:20',
            'email_utilizador' => 'nullable|email|unique:users,email_utilizador,' . $membro->id,
            'perfil' => 'nullable|in:admin,encarregado,atleta,staff,user',
            'password' => 'nullable|string|min:8',
            // Financial
            'tipo_mensalidade' => 'nullable|string',
            // Sports
            'num_federacao' => 'nullable|string|max:50',
            'cartao_federacao' => 'nullable|string|max:50',
            'numero_pmb' => 'nullable|string|max:50',
            'data_inscricao' => 'nullable|date',
            'data_atestado_medico' => 'nullable|date',
            'informacoes_medicas' => 'nullable|string',
            'ativo_desportivo' => 'boolean',
            // Consents
            'rgpd' => 'boolean',
            'consentimento' => 'boolean',
            'afiliacao' => 'boolean',
            'declaracao_de_transporte' => 'boolean',
        ]);

        // Prepare update data
        $updateData = [
            'numero_socio' => $validated['numero_socio'] ?? null,
            'nome_completo' => $validated['nome_completo'],
            'name' => $validated['nome_completo'], // Keep Laravel auth compatibility
            'data_nascimento' => $validated['data_nascimento'] ?? null,
            'sexo' => $validated['sexo'] ?? null,
            'menor' => $validated['menor'] ?? false,
            'tipo_membro' => json_encode($validated['tipo_membro']),
            'estado' => $validated['estado'],
            'nif' => $validated['nif'] ?? null,
            'morada' => $validated['morada'] ?? null,
            'codigo_postal' => $validated['codigo_postal'] ?? null,
            'localidade' => $validated['localidade'] ?? null,
            'telefone' => $validated['telefone'] ?? null,
            'telemovel' => $validated['telemovel'] ?? null,
            'email' => $validated['email'] ?? null,
            'contacto_emergencia_nome' => $validated['contacto_emergencia_nome'] ?? null,
            'contacto_emergencia_telefone' => $validated['contacto_emergencia_telefone'] ?? null,
            'email_utilizador' => $validated['email_utilizador'] ?? null,
            'perfil' => $validated['perfil'] ?? 'user',
            // Financial
            'tipo_mensalidade' => $validated['tipo_mensalidade'] ?? null,
            // Sports
            'num_federacao' => $validated['num_federacao'] ?? null,
            'cartao_federacao' => $validated['cartao_federacao'] ?? null,
            'numero_pmb' => $validated['numero_pmb'] ?? null,
            'data_inscricao' => $validated['data_inscricao'] ?? null,
            'data_atestado_medico' => $validated['data_atestado_medico'] ?? null,
            'informacoes_medicas' => $validated['informacoes_medicas'] ?? null,
            'ativo_desportivo' => $validated['ativo_desportivo'] ?? false,
            // Consents
            'rgpd' => $validated['rgpd'] ?? false,
            'consentimento' => $validated['consentimento'] ?? false,
            'afiliacao' => $validated['afiliacao'] ?? false,
            'declaracao_de_transporte' => $validated['declaracao_de_transporte'] ?? false,
        ];

        // Only update password if provided
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $membro->update($updateData);

        Log::info('Member updated successfully', ['id' => $membro->id]);

        return redirect()->route('membros.show', $membro->id)
            ->with('success', 'Membro atualizado com sucesso!');
            
    } catch (\Illuminate\Validation\ValidationException $e) {
        return redirect()->back()
            ->withInput()
            ->withErrors($e->errors());
    } catch (\Exception $e) {
        Log::error('Error updating member: ' . $e->getMessage());
        
        return redirect()->back()
            ->withInput()
            ->with('error', 'Erro ao atualizar membro: ' . $e->getMessage());
    }
}

    public function destroy(User $membro): RedirectResponse
    {
        try {
            $membro->delete();

            return redirect()->route('membros.index')
                ->with('success', 'Membro excluído com sucesso!');
                
        } catch (\Exception $e) {
            Log::error('Error deleting member: ' . $e->getMessage());
            
            return redirect()->back()
                ->with('error', 'Erro ao excluir membro: ' . $e->getMessage());
        }
    }
}
