<?php

namespace App\Http\Requests\Sports;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreResultRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $payload = [];

        if ($this->filled('tempo') && !$this->filled('tempo_oficial')) {
            $payload['tempo_oficial'] = $this->input('tempo');
        }

        if ($this->filled('colocacao') && !$this->filled('posicao')) {
            $payload['posicao'] = $this->input('colocacao');
        }

        if ($this->filled('desqualificado') && !$this->exists('desclassificado')) {
            $payload['desclassificado'] = $this->boolean('desqualificado');
        }

        if ($payload !== []) {
            $this->merge($payload);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'prova_id' => ['required', 'uuid', 'exists:provas,id'],
            'user_id' => [
                'required',
                'uuid',
                'exists:users,id',
                Rule::unique('results', 'user_id')->where(fn ($query) => $query->where('prova_id', $this->input('prova_id'))),
            ],
            'tempo_oficial' => ['required', 'numeric', 'min:0'],
            'posicao' => ['nullable', 'integer', 'min:1'],
            'pontos_fina' => ['nullable', 'integer', 'min:0'],
            'desclassificado' => ['nullable', 'boolean'],
            'observacoes' => ['nullable', 'string'],
        ];
    }
}
