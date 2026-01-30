<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTrainingRequest extends FormRequest
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
            'data_treino' => ['required', 'date'],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'hora_fim' => ['nullable', 'date_format:H:i', 'after:hora_inicio'],
            'localizacao' => ['nullable', 'string', 'max:255'],
            'age_group_id' => ['nullable', 'exists:age_groups,id'],
            'athletes' => ['nullable', 'array'],
            'athletes.*' => ['exists:users,id'],
            'observacoes' => ['nullable', 'string'],
        ];
    }
}
