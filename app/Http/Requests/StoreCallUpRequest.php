<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCallUpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event_id' => ['required', 'exists:events,id'],
            'team_id' => ['required', 'exists:teams,id'],
            'called_up_athletes' => ['required', 'array'],
            'called_up_athletes.*' => ['exists:users,id'],
            'attendances' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
