<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
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
            'codigo' => ['required', 'string', 'max:50', 'unique:products'],
            'preco' => ['required', 'numeric', 'min:0'],
            'quantidade_stock' => ['required', 'integer', 'min:0'],
            'stock_minimo' => ['nullable', 'integer', 'min:0'],
            'category_id' => ['required', 'exists:product_categories,id'],
            'estado' => ['required', 'in:ativo,inativo,esgotado'],
            'imagem' => ['nullable', 'string'],
        ];
    }
}
