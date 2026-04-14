<?php

namespace App\Http\Requests\Communication;

use App\Support\Communication\AlertCategoryRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCommunicationTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'channel' => ['required', 'in:email,sms,push,interno,alert_app'],
            'category' => ['nullable', 'string', Rule::in(AlertCategoryRegistry::codes(false))],
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'variables_json' => ['nullable', 'array'],
            'status' => ['required', 'in:ativo,em_revisao,inativo'],
        ];
    }
}
