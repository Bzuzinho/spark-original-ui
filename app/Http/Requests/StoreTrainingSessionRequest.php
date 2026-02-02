<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTrainingSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'team_id' => ['nullable', 'exists:teams,id'],
            'datetime' => ['required', 'date'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:600'],
            'location' => ['nullable', 'string', 'max:255'],
            'objectives' => ['nullable', 'string'],
            'status' => ['required', 'in:scheduled,completed,cancelled'],
        ];
    }
}
