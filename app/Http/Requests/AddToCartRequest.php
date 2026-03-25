<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddToCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'article_id' => ['required', 'exists:products,id'],
            'target_user_id' => ['nullable', 'exists:users,id'],
            'variant' => ['nullable', 'string', 'max:120'],
            'quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
