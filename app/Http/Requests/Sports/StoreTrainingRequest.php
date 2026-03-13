<?php

namespace App\Http\Requests\Sports;

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
            'numero_treino' => ['nullable', 'string', 'max:255'],
            'data' => ['required', 'date'],
            'hora_inicio' => ['nullable', 'date_format:H:i'],
            'hora_fim' => ['nullable', 'date_format:H:i', 'after:hora_inicio'],
            'local' => ['nullable', 'string', 'max:255'],
            'epoca_id' => ['nullable', 'uuid', 'exists:seasons,id'],
            'microciclo_id' => ['nullable', 'uuid', 'exists:microcycles,id'],
            'tipo_treino' => ['required', 'string', 'max:30'],
            'volume_planeado_m' => ['nullable', 'integer', 'min:0'],
            'descricao_treino' => ['required', 'string'],
            'notas_gerais' => ['nullable', 'string'],
            'escaloes' => ['nullable', 'array'],
            'escaloes.*' => ['uuid', 'exists:age_groups,id'],
        ];
    }
}
