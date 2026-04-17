<?php

namespace App\Http\Requests\AccessControl;

use App\Support\AccessControl\AccessControlCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncUserTypeLandingPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'landing_module_key' => ['required', 'string', Rule::in(AccessControlCatalog::allMenuModuleKeys())],
            'base_page_key' => ['required', 'string', Rule::in(AccessControlCatalog::allBasePageKeys())],
        ];
    }
}