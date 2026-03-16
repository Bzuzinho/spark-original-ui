<?php

namespace App\Http\Requests\Sports;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'data' => ['nullable', 'date'],
            'hora_inicio' => ['nullable', 'date_format:H:i'],
            'hora_fim' => ['nullable', 'date_format:H:i', 'after:hora_inicio'],
            'local' => ['nullable', 'string', 'max:255'],
            'epoca_id' => ['nullable', 'uuid', 'exists:seasons,id'],
            'microciclo_id' => ['nullable', 'uuid', 'exists:microcycles,id'],
            'tipo_treino' => [
                'required',
                'string',
                'max:100',
                Rule::exists('training_type_configs', 'nome')->where(fn ($query) => $query->where('ativo', true)),
            ],
            'volume_planeado_m' => ['nullable', 'integer', 'min:0'],
            'descricao_treino' => ['required', 'string'],
            'notas_gerais' => ['nullable', 'string'],
            'escaloes' => ['nullable', 'array'],
            'escaloes.*' => ['uuid', 'exists:age_groups,id'],
            'series_linhas' => ['nullable', 'array'],
            'series_linhas.*.repeticoes' => ['nullable', 'integer', 'min:0'],
            'series_linhas.*.exercicio' => ['nullable', 'string', 'max:255'],
            'series_linhas.*.metros' => ['nullable', 'integer', 'min:0'],
            'series_linhas.*.zona' => [
                'nullable',
                'string',
                Rule::exists('training_zone_configs', 'codigo')->where(fn ($query) => $query->where('ativo', true)),
            ],
        ];
    }
}
