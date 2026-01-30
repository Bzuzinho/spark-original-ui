<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSponsorRequest extends FormRequest
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
            'valor_patrocinio' => ['required', 'numeric', 'min:0'],
            'data_inicio' => ['required', 'date'],
            'data_fim' => ['nullable', 'date', 'after_or_equal:data_inicio'],
            'category_id' => ['required', 'exists:sponsor_categories,id'],
            'estado' => ['required', 'in:ativo,inativo,expirado'],
            'logo' => ['nullable', 'string'],
            'website' => ['nullable', 'url'],
            'contacto' => ['nullable', 'string', 'max:255'],
        ];
    }
}
