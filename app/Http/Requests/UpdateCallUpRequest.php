<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCallUpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'atletas_convocados' => ['required', 'array'],
            'atletas_convocados.*' => ['exists:users,id'],
            'presencas' => ['nullable', 'array'],
            'observacoes' => ['nullable', 'string'],
        ];
    }
}
