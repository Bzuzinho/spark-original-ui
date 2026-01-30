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
            'codigo' => ['required', 'string', 'max:50', Rule::unique('products')->ignore($this->loja)],
            'preco' => ['required', 'numeric', 'min:0'],
            'quantidade_stock' => ['required', 'integer', 'min:0'],
            'stock_minimo' => ['nullable', 'integer', 'min:0'],
            'category_id' => ['required', 'exists:product_categories,id'],
            'estado' => ['required', 'in:ativo,inativo,esgotado'],
            'imagem' => ['nullable', 'string'],
        ];
    }
}
