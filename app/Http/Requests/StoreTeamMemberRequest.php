<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeamMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'team_id' => ['required', 'exists:teams,id'],
            'user_id' => ['required', 'exists:users,id'],
            'posicao' => ['nullable', 'string', 'max:255'],
            'numero_camisola' => ['nullable', 'integer', 'min:1', 'max:999'],
            'data_entrada' => ['required', 'date'],
            'data_saida' => ['nullable', 'date', 'after:data_entrada'],
        ];
    }
}
