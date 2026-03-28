<?php

namespace App\Http\Requests\Communication;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommunicationSegmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'in:dynamic,manual,system'],
            'description' => ['nullable', 'string'],
            'rules_json' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
