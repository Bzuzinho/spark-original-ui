<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'tipo' => ['required', 'in:email,redes_sociais,evento,outro'],
            'data_inicio' => ['required', 'date'],
            'data_fim' => ['nullable', 'date', 'after_or_equal:data_inicio'],
            'estado' => ['required', 'in:planeada,ativa,concluida,cancelada'],
            'orcamento' => ['nullable', 'numeric', 'min:0'],
            'alcance_estimado' => ['nullable', 'integer', 'min:0'],
            'notas' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome da campanha é obrigatório.',
            'nome.max' => 'O nome não pode ter mais de 255 caracteres.',
            'tipo.required' => 'O tipo de campanha é obrigatório.',
            'tipo.in' => 'O tipo selecionado não é válido.',
            'data_inicio.required' => 'A data de início é obrigatória.',
            'data_inicio.date' => 'A data de início deve ser uma data válida.',
            'data_fim.date' => 'A data de fim deve ser uma data válida.',
            'data_fim.after_or_equal' => 'A data de fim deve ser posterior ou igual à data de início.',
            'estado.required' => 'O estado da campanha é obrigatório.',
            'estado.in' => 'O estado selecionado não é válido.',
            'orcamento.numeric' => 'O orçamento deve ser um número.',
            'orcamento.min' => 'O orçamento deve ser maior ou igual a zero.',
            'alcance_estimado.integer' => 'O alcance estimado deve ser um número inteiro.',
            'alcance_estimado.min' => 'O alcance estimado deve ser maior ou igual a zero.',
        ];
    }
}
