<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMembrosImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rows' => ['required', 'array', 'min:1', 'max:1000'],
            'rows.*' => ['required', 'array'],
            'mapping' => ['required', 'array', 'min:1'],
            'mapping.*' => ['nullable', 'string', 'max:255'],
            'options' => ['sometimes', 'array'],
            'options.import_only_valid_rows' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'rows.required' => 'É necessário enviar linhas para importar.',
            'rows.max' => 'A importação está limitada a 1000 linhas por operação.',
            'mapping.required' => 'É necessário enviar o mapeamento das colunas.',
        ];
    }
}