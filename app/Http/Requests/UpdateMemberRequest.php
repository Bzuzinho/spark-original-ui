<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // ou implementar lógica de autorização
    }

    public function rules(): array
    {
        $userId = $this->route('member')->id;
        
        return [
            // Required fields
            'full_name' => 'required|string|max:255',
            'data_nascimento' => 'required|date|before:today',
            'email_utilizador' => 'required|email|unique:users,email_utilizador,' . $userId,
            
            // CRÍTICO: member_type DEVE ser array com pelo menos 1 item
            'member_type' => 'required|array|min:1',
            'member_type.*' => 'in:atleta,socio,treinador,dirigente,encarregado_educacao,funcionario',
            
            // Optional fields
            'password' => 'nullable|string|min:8',
            'foto_perfil' => 'nullable|string',
            'nif' => 'nullable|string|size:9|unique:users,nif,' . $userId,
            'cc' => 'nullable|string|max:20',
            'sexo' => 'nullable|in:masculino,feminino',
            'estado' => 'nullable|in:ativo,inativo,suspenso',
            'perfil' => 'nullable|in:admin,encarregado,atleta,staff',
            
            // ... outros campos opcionais
            'morada' => 'nullable|string|max:255',
            'codigo_postal' => 'nullable|string|max:10',
            'localidade' => 'nullable|string|max:100',
            'contacto' => 'nullable|string|max:20',
            'telemovel' => 'nullable|string|max:20',
            'tipo_mensalidade' => 'nullable|string',
            'centro_custo' => 'nullable|array',
            'num_federacao' => 'nullable|string|max:50',
            'numero_pmb' => 'nullable|string|max:50',
            'escalao' => 'nullable|array',
            'encarregado_educacao' => 'nullable|array',
            'educandos' => 'nullable|array',
            // ... adiciona todos os outros campos
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Nome completo é obrigatório',
            'data_nascimento.required' => 'Data de nascimento é obrigatória',
            'email_utilizador.required' => 'Email de utilizador é obrigatório',
            'email_utilizador.unique' => 'Este email já está em uso',
            'member_type.required' => 'Selecione pelo menos um tipo de membro',
            'member_type.min' => 'Selecione pelo menos um tipo de membro',
        ];
    }
}