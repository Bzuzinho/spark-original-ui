<?php

namespace App\Http\Requests\AccessControl;

use App\Support\AccessControl\AccessControlCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncUserTypeMenuModulesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'module_keys' => ['required', 'array'],
            'module_keys.*' => ['string', Rule::in(AccessControlCatalog::allMenuModuleKeys())],
        ];
    }
}