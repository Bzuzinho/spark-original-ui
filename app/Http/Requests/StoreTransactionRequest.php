<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'nullable|uuid|exists:users,id',
            'category_id' => 'nullable|uuid|exists:financial_categories,id',
            'descricao' => 'required|string|max:255',
            'valor' => 'required|numeric|min:0',
            'tipo' => 'required|in:receita,despesa',
            'data' => 'required|date',
            'metodo_pagamento' => 'nullable|in:dinheiro,transferencia,mbway,multibanco,cartao',
            'comprovativo' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'estado' => 'nullable|in:paga,pendente,cancelada',
            'observacoes' => 'nullable|string',
        ];
    }
}
