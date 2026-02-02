<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['required', 'date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'location' => ['nullable', 'string', 'max:255'],
            'location_details' => ['nullable', 'string'],
            'type' => ['required', 'string', 'max:50'],
            'tipo_config_id' => ['nullable', 'exists:event_type_configs,id'],
            'pool_type' => ['nullable', 'in:piscina_25m,piscina_50m,aguas_abertas'],
            'visibility' => ['nullable', 'in:publico,privado,escaloes'],
            'eligible_age_groups' => ['nullable', 'array'],
            'transport_required' => ['nullable', 'boolean'],
            'transport_details' => ['nullable', 'string'],
            'departure_time' => ['nullable', 'date_format:H:i'],
            'departure_location' => ['nullable', 'string', 'max:255'],
            'registration_fee' => ['nullable', 'numeric', 'min:0'],
            'cost_per_race' => ['nullable', 'numeric', 'min:0'],
            'cost_per_dive' => ['nullable', 'numeric', 'min:0'],
            'relay_cost' => ['nullable', 'numeric', 'min:0'],
            'centro_custo_id' => ['nullable', 'exists:cost_centers,id'],
            'notes' => ['nullable', 'string'],
            'status' => ['nullable', 'in:rascunho,agendado,em_curso,concluido,cancelado'],
            'recurring' => ['nullable', 'boolean'],
            'recurrence_start_date' => ['nullable', 'date', 'required_if:recurring,true'],
            'recurrence_end_date' => ['nullable', 'date', 'after_or_equal:recurrence_start_date'],
            'recurrence_weekdays' => ['nullable', 'array'],
        ];
    }
}
