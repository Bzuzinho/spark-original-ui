<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InvoiceLogisticsRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo' => ['nullable', 'exists:invoice_types,codigo'],
            'data_emissao' => ['nullable', 'date'],
            'data_vencimento' => ['nullable', 'date'],
            'observacoes' => ['nullable', 'string'],
        ];
    }
}
