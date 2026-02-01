<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSponsorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Ajustar conforme permissões
    }

    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'logo' => ['nullable', 'image', 'max:2048'], // 2MB
            'website' => ['nullable', 'url', 'max:255'],
            'contacto' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'tipo' => ['required', 'in:principal,secundario,apoio'],
            'valor_anual' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'data_inicio' => ['required', 'date'],
            'data_fim' => ['nullable', 'date', 'after:data_inicio'],
            'estado' => ['required', 'in:ativo,inativo,expirado'],
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome do patrocinador é obrigatório',
            'tipo.required' => 'Selecione o tipo de patrocínio',
            'tipo.in' => 'Tipo de patrocínio inválido',
            'data_inicio.required' => 'A data de início é obrigatória',
            'data_fim.after' => 'A data de fim deve ser posterior à data de início',
            'email.email' => 'Email inválido',
            'website.url' => 'URL inválida',
            'logo.image' => 'O ficheiro deve ser uma imagem',
            'logo.max' => 'A imagem não pode exceder 2MB',
        ];
    }
}
