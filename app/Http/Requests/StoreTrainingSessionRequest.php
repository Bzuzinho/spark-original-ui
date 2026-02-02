<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTrainingSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'team_id' => ['nullable', 'exists:teams,id'],
            'data_hora' => ['required', 'date'],
            'duracao_minutos' => ['required', 'integer', 'min:1', 'max:600'],
            'local' => ['nullable', 'string', 'max:255'],
            'objetivos' => ['nullable', 'string'],
            'estado' => ['required', 'in:agendado,realizado,cancelado'],
        ];
    }
}
