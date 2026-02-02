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
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'in:email,social_media,event,other'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['required', 'in:planned,active,completed,cancelled'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'estimated_reach' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome da campanha é obrigatório.',
            'name.max' => 'O nome não pode ter mais de 255 caracteres.',
            'type.required' => 'O tipo de campanha é obrigatório.',
            'type.in' => 'O tipo selecionado não é válido.',
            'start_date.required' => 'A data de início é obrigatória.',
            'start_date.date' => 'A data de início deve ser uma data válida.',
            'end_date.date' => 'A data de fim deve ser uma data válida.',
            'end_date.after_or_equal' => 'A data de fim deve ser posterior ou igual à data de início.',
            'status.required' => 'O estado da campanha é obrigatório.',
            'status.in' => 'O estado selecionado não é válido.',
            'budget.numeric' => 'O orçamento deve ser um número.',
            'budget.min' => 'O orçamento deve ser maior ou igual a zero.',
            'estimated_reach.integer' => 'O alcance estimado deve ser um número inteiro.',
            'estimated_reach.min' => 'O alcance estimado deve ser maior ou igual a zero.',
        ];
    }
}
