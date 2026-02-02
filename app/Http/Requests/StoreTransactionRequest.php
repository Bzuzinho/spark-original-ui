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
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'type' => 'required|in:income,expense',
            'date' => 'required|date',
            'payment_method' => 'nullable|in:cash,transfer,mbway,atm,card',
            'receipt' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'status' => 'nullable|in:paid,pending,cancelled',
            'notes' => 'nullable|string',
        ];
    }
}
