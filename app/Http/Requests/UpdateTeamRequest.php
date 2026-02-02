<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'age_group' => ['nullable', 'string', 'max:255'],
            'coach_id' => ['nullable', 'exists:users,id'],
            'founding_year' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'active' => ['boolean'],
        ];
    }
}
