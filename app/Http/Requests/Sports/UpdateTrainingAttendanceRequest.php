<?php

namespace App\Http\Requests\Sports;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTrainingAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'presente' => ['nullable', 'boolean'],
            'estado' => ['nullable', 'in:presente,ausente,justificado,lesionado,limitado,doente'],
            'volume_real_m' => ['nullable', 'integer', 'min:0'],
            'rpe' => ['nullable', 'integer', 'min:1', 'max:10'],
            'observacoes_tecnicas' => ['nullable', 'string'],
        ];
    }
}
