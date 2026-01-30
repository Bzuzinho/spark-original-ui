<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($this->membro)],
            'password' => ['nullable', 'string', 'min:8'],
            'numero_socio' => ['nullable', 'string', 'max:50', Rule::unique('users')->ignore($this->membro)],
            'numero_cc' => ['nullable', 'string', 'max:50'],
            'telefone' => ['nullable', 'string', 'max:20'],
            'data_nascimento' => ['nullable', 'date'],
            'morada' => ['nullable', 'string'],
            'codigo_postal' => ['nullable', 'string', 'max:10'],
            'localidade' => ['nullable', 'string', 'max:255'],
            'tipo_membro' => ['nullable', 'json'],
            'estado' => ['required', 'in:ativo,inativo,suspenso'],
            'age_group_id' => ['nullable', 'exists:age_groups,id'],
            'user_types' => ['nullable', 'array'],
            'user_types.*' => ['exists:user_types,id'],
            'encarregados' => ['nullable', 'array'],
            'encarregados.*' => ['exists:users,id'],
            'observacoes' => ['nullable', 'string'],
        ];
    }
}
