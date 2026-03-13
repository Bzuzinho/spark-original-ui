<?php

namespace App\Http\Requests\Sports;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeamResultRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->filled('competition_id') && !$this->filled('competicao_id')) {
            $this->merge(['competicao_id' => $this->input('competition_id')]);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'competicao_id' => ['required', 'uuid', 'exists:competitions,id'],
            'equipa' => ['required', 'string', 'max:255'],
            'classificacao' => ['nullable', 'integer', 'min:1'],
            'pontos' => ['nullable', 'integer'],
            'observacoes' => ['nullable', 'string'],
        ];
    }
}
