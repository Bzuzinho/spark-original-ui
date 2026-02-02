<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['nullable', 'string', 'min:8'],
            'member_number' => ['nullable', 'string', 'max:50', 'unique:users'],
            'id_card_number' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:20'],
            'birth_date' => ['nullable', 'date'],
            'address' => ['nullable', 'string'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'city' => ['nullable', 'string', 'max:255'],
            'member_type' => ['nullable', 'json'],
            'status' => ['required', 'in:active,inactive,suspended'],
            'age_group_id' => ['nullable', 'exists:age_groups,id'],
            'user_types' => ['nullable', 'array'],
            'user_types.*' => ['exists:user_types,id'],
            'encarregados' => ['nullable', 'array'],
            'encarregados.*' => ['exists:users,id'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
