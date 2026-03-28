<?php

namespace App\Http\Requests\Communication;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommunicationCampaignRequest extends FormRequest
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
            'segment_id' => ['required', 'exists:communication_segments,id'],
            'status' => ['nullable', 'in:rascunho,agendada,em_processamento,enviada,falhada,cancelada'],
            'scheduled_at' => ['nullable', 'date', 'after_or_equal:now'],
            'create_in_app_alert' => ['nullable', 'boolean'],
            'alert_title' => ['nullable', 'string', 'max:255'],
            'alert_message' => ['nullable', 'string'],
            'alert_link' => ['nullable', 'string', 'max:255'],
            'alert_type' => ['nullable', 'in:info,warning,success,error'],
            'notes' => ['nullable', 'string'],
            'channels' => ['required', 'array', 'min:1'],
            'channels.*.channel' => ['required', 'in:email,sms,push,interno,alert_app'],
            'channels.*.template_id' => ['nullable', 'exists:communication_templates,id'],
            'channels.*.subject' => ['nullable', 'string', 'max:255'],
            'channels.*.message_body' => ['nullable', 'string'],
            'channels.*.is_enabled' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $channels = collect($this->input('channels', []));

            if ($channels->filter(fn ($channel) => (bool) ($channel['is_enabled'] ?? true))->isEmpty()) {
                $validator->errors()->add('channels', 'Pelo menos um canal ativo e obrigatorio.');
            }

            $containsAlertApp = $channels->contains(fn ($channel) => ($channel['channel'] ?? null) === 'alert_app' && (bool) ($channel['is_enabled'] ?? true));
            $createAlert = (bool) $this->boolean('create_in_app_alert');

            if (($containsAlertApp || $createAlert) && !$this->filled('alert_title')) {
                $validator->errors()->add('alert_title', 'Titulo do alerta e obrigatorio para canal alert_app.');
            }

            if (($containsAlertApp || $createAlert) && !$this->filled('alert_message')) {
                $validator->errors()->add('alert_message', 'Mensagem do alerta e obrigatoria para canal alert_app.');
            }

            foreach ($channels as $index => $channel) {
                $hasTemplate = !empty($channel['template_id']);
                $hasBody = !empty($channel['message_body']);

                if (!$hasTemplate && !$hasBody) {
                    $validator->errors()->add("channels.{$index}.message_body", 'Mensagem e obrigatoria quando nao existe template.');
                }
            }
        });
    }
}
