<?php

namespace App\Http\Requests\Sports;

use Illuminate\Foundation\Http\FormRequest;

class ScheduleTrainingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'data' => ['required', 'date'],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'hora_fim' => ['nullable', 'date_format:H:i', 'after:hora_inicio'],
            'local' => ['nullable', 'string', 'max:255'],
            'epoca_id' => ['nullable', 'uuid', 'exists:seasons,id'],
            'macrocycle_id' => ['nullable', 'uuid', 'exists:macrocycles,id'],
            'microciclo_id' => ['nullable', 'uuid', 'exists:microcycles,id'],
            'escaloes' => ['required', 'array', 'min:1'],
            'escaloes.*' => ['uuid', 'exists:age_groups,id'],
        ];
    }
}
