<?php

namespace App\Http\Requests\AccessControl;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncUserTypePermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'permissions' => ['required', 'array'],
            'permissions.*.permission_node_id' => ['required', 'uuid', 'distinct', Rule::exists('permission_nodes', 'id')],
            'permissions.*.can_view' => ['required', 'boolean'],
            'permissions.*.can_edit' => ['required', 'boolean'],
            'permissions.*.can_delete' => ['required', 'boolean'],
        ];
    }
}