<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCommunicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assunto' => ['required', 'string', 'max:255'],
            'mensagem' => ['required', 'string'],
            'tipo' => ['required', 'in:email,sms,notificacao,aviso'],
            'destinatarios' => ['required', 'array', 'min:1'],
            'destinatarios.*' => ['string'],
            'estado' => ['nullable', 'in:rascunho,agendada,enviada,falhou'],
            'agendado_para' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'assunto.required' => 'O assunto é obrigatório.',
            'mensagem.required' => 'A mensagem é obrigatória.',
            'tipo.required' => 'O tipo de comunicação é obrigatório.',
            'tipo.in' => 'O tipo de comunicação deve ser: email, sms, notificacao ou aviso.',
            'destinatarios.required' => 'Deve selecionar pelo menos um destinatário.',
            'destinatarios.min' => 'Deve selecionar pelo menos um destinatário.',
        ];
    }
}
