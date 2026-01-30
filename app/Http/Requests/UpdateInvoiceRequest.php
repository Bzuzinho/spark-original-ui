<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'data_emissao' => ['required', 'date'],
            'data_vencimento' => ['required', 'date', 'after_or_equal:data_emissao'],
            'estado_pagamento' => ['required', 'in:pendente,pago,atrasado,cancelado'],
            'valor_total' => ['required', 'numeric', 'min:0'],
            'observacoes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.descricao' => ['required', 'string', 'max:255'],
            'items.*.quantidade' => ['required', 'integer', 'min:1'],
            'items.*.preco_unitario' => ['required', 'numeric', 'min:0'],
            'items.*.subtotal' => ['required', 'numeric', 'min:0'],
        ];
    }
}
