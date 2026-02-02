<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCallUpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'called_up_athletes' => ['required', 'array'],
            'called_up_athletes.*' => ['exists:users,id'],
            'attendances' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
