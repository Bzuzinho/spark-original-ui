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

class MembrosController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Membros/Index', [
            'members' => User::with(['userTypes', 'ageGroup', 'encarregados', 'educandos'])
                ->latest()
                ->get(),
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Membros/Create', [
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
            'guardians' => User::whereJsonContains('tipo_membro', 'encarregado_educacao')->get(),
        ]);
    }

    public function store(StoreMemberRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();
            
            // Auto-generate numero_socio if not provided
            if (empty($data['numero_socio'])) {
                $data['numero_socio'] = $this->generateMemberNumber();
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
            
            // Sync relationships
            if (isset($data['user_types'])) {
                $member->userTypes()->sync($data['user_types']);
            }
            
            // Sync guardian relationship
            if (isset($data['encarregado_educacao']) && is_array($data['encarregado_educacao'])) {
                $member->encarregados()->sync($data['encarregado_educacao']);
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
        return Inertia::render('Membros/Show', [
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
            'allUsers' => User::select('id', 'nome_completo', 'numero_socio', 'tipo_membro')->get(),
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
        ]);
    }

    public function edit(User $member): Response
    {
        return Inertia::render('Membros/Edit', [
            'member' => $member->load(['userTypes', 'ageGroup', 'encarregados', 'educandos']),
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
            'guardians' => User::whereJsonContains('tipo_membro', 'encarregado_educacao')
                ->where('id', '!=', $member->id)
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
            
            // Sync relationships
            if (isset($data['user_types'])) {
                $member->userTypes()->sync($data['user_types']);
            }
            
            // Sync guardian relationship
            if (isset($data['encarregado_educacao']) && is_array($data['encarregado_educacao'])) {
                $member->encarregados()->sync($data['encarregado_educacao']);
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
        $lastMember = User::whereNotNull('numero_socio')
            ->where('numero_socio', 'REGEXP', '^[0-9]+$')
            ->orderBy('numero_socio', 'desc')
            ->first();
        
        if ($lastMember && $lastMember->numero_socio) {
            $lastNumber = (int) $lastMember->numero_socio;
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }
        
        // Use 4 digits to support up to 9999 members
        return str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
