<?php

namespace App\Http\Requests\Communication;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInternalMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'recipient_ids' => ['required', 'array', 'min:1'],
            'recipient_ids.*' => ['required', 'string', 'distinct', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'type' => ['nullable', Rule::in(['info', 'warning', 'success', 'error'])],
            'parent_id' => ['nullable', 'string', 'exists:internal_messages,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'recipient_ids.required' => 'Selecione pelo menos um destinatário.',
            'recipient_ids.min' => 'Selecione pelo menos um destinatário.',
            'subject.required' => 'O assunto é obrigatório.',
            'message.required' => 'A mensagem é obrigatória.',
        ];
    }
}