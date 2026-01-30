<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'data_inicio' => ['required', 'date'],
            'data_fim' => ['nullable', 'date', 'after_or_equal:data_inicio'],
            'localizacao' => ['nullable', 'string', 'max:255'],
            'event_type_id' => ['required', 'exists:event_types,id'],
            'estado' => ['required', 'in:agendado,em_curso,concluido,cancelado'],
            'observacoes' => ['nullable', 'string'],
        ];
    }
}
