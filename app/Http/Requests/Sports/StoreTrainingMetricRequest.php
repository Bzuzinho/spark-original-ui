<?php

namespace App\Http\Requests\Sports;

use Illuminate\Foundation\Http\FormRequest;

class StoreTrainingMetricRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'treino_id' => ['required', 'uuid', 'exists:trainings,id'],
            'user_id' => ['required', 'uuid', 'exists:users,id'],
            'rows' => ['required', 'array'],
            'rows.*.metrica' => ['nullable', 'string', 'max:120'],
            'rows.*.valor' => ['nullable', 'string', 'max:120'],
            'rows.*.tempo' => ['nullable', 'regex:/^\d{1,2}:\d{2}(?:\.\d{1,3})?$/'],
            'rows.*.observacao' => ['nullable', 'string'],
        ];
    }
}
