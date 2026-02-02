<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
            'codigo' => ['required', 'string', 'max:255', Rule::unique('products')->ignore($this->loja)],
            'categoria' => ['nullable', 'string', 'max:255'],
            'preco' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'stock_minimo' => ['required', 'integer', 'min:0'],
            'imagem' => ['nullable', 'string'],
            'ativo' => ['boolean'],
        ];
    }
}
