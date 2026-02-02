<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeamMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'team_id' => ['required', 'exists:teams,id'],
            'user_id' => ['required', 'exists:users,id'],
            'position' => ['nullable', 'string', 'max:255'],
            'jersey_number' => ['nullable', 'integer', 'min:1', 'max:999'],
            'join_date' => ['required', 'date'],
            'leave_date' => ['nullable', 'date', 'after:join_date'],
        ];
    }
}
