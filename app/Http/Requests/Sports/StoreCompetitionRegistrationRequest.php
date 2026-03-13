<?php

namespace App\Http\Requests\Sports;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCompetitionRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'prova_id' => ['required', 'uuid', 'exists:provas,id'],
            'user_id' => [
                'required',
                'uuid',
                'exists:users,id',
                Rule::unique('competition_registrations', 'user_id')->where(fn ($query) => $query->where('prova_id', $this->input('prova_id'))),
            ],
            'estado' => ['nullable', 'string', 'max:30'],
            'valor_inscricao' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
