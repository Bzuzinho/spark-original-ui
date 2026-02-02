<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCallUpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event_id' => ['required', 'exists:events,id'],
            'team_id' => ['required', 'exists:teams,id'],
            'atletas_convocados' => ['required', 'array'],
            'atletas_convocados.*' => ['exists:users,id'],
            'presencas' => ['nullable', 'array'],
            'observacoes' => ['nullable', 'string'],
        ];
    }
}
