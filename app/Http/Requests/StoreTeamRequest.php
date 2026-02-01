<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'escalao' => ['nullable', 'string', 'max:255'],
            'treinador_id' => ['nullable', 'exists:users,id'],
            'ano_fundacao' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'ativa' => ['boolean'],
        ];
    }
}
