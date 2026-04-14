<?php

namespace App\Http\Requests\Communication;

use App\Models\CommunicationTemplate;
use App\Support\Communication\AlertCategoryRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SendIndividualCommunicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'alert_category' => ['required', 'string', Rule::in(AlertCategoryRegistry::codes(false))],
            'alert_title' => ['nullable', 'string', 'max:255'],
            'alert_message' => ['nullable', 'string'],
            'alert_type' => ['nullable', 'in:info,warning,success,error'],
            'scheduled_at' => ['nullable', 'date', 'after_or_equal:now'],
            'recipient_user_ids' => ['required', 'array', 'min:1'],
            'recipient_user_ids.*' => ['required', 'exists:users,id'],
            'recipient_age_group_ids' => ['nullable', 'array'],
            'recipient_age_group_ids.*' => ['required', 'exists:age_groups,id'],
            'recipient_user_types' => ['nullable', 'array'],
            'recipient_user_types.*' => ['required', 'string', 'max:255'],
            'channels' => ['required', 'array', 'min:1'],
            'channels.*.channel' => ['required', 'in:email,sms,interno,alert_app'],
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
            $alertCategory = AlertCategoryRegistry::find($this->input('alert_category'), false);
            $allowedChannels = collect($alertCategory['channels'] ?? [])->values();
            $templates = CommunicationTemplate::query()
                ->whereIn('id', $channels->pluck('template_id')->filter()->unique())
                ->get()
                ->keyBy('id');

            if ($channels->filter(fn ($channel) => (bool) ($channel['is_enabled'] ?? true))->isEmpty()) {
                $validator->errors()->add('channels', 'Pelo menos um canal ativo e obrigatorio.');
            }

            foreach ($channels as $index => $channel) {
                if (!(bool) ($channel['is_enabled'] ?? true)) {
                    continue;
                }

                $hasTemplate = !empty($channel['template_id']);
                $hasBody = !empty($channel['message_body']);

                if (!$hasTemplate && !$hasBody) {
                    $validator->errors()->add("channels.{$index}.message_body", 'Mensagem e obrigatoria quando nao existe template.');
                }

                if (!$hasTemplate) {
                    continue;
                }

                $template = $templates->get($channel['template_id']);
                if (!$template) {
                    continue;
                }

                if ($template->channel !== ($channel['channel'] ?? null)) {
                    $validator->errors()->add("channels.{$index}.template_id", 'O template selecionado nao pertence ao mesmo canal de envio.');
                }

                if ($allowedChannels->isNotEmpty() && !$allowedChannels->contains($channel['channel'] ?? null)) {
                    $validator->errors()->add("channels.{$index}.channel", 'O canal selecionado nao esta permitido para a categoria do alerta.');
                }

                $templateCategory = $template->category;
                $alertCategory = $this->input('alert_category');
                if ($templateCategory && $templateCategory !== 'geral' && $templateCategory !== $alertCategory) {
                    $validator->errors()->add("channels.{$index}.template_id", 'O template selecionado nao pertence a categoria do alerta.');
                }
            }

            foreach ($channels as $index => $channel) {
                if (!(bool) ($channel['is_enabled'] ?? true)) {
                    continue;
                }

                if ($allowedChannels->isNotEmpty() && !$allowedChannels->contains($channel['channel'] ?? null)) {
                    $validator->errors()->add("channels.{$index}.channel", 'O canal selecionado nao esta permitido para a categoria do alerta.');
                }
            }

            $containsAlertApp = $channels->contains(fn ($channel) => ($channel['channel'] ?? null) === 'alert_app' && (bool) ($channel['is_enabled'] ?? true));

            if ($containsAlertApp && !$this->filled('alert_title')) {
                $validator->errors()->add('alert_title', 'Titulo do alerta e obrigatorio para canal alert_app.');
            }

            if ($containsAlertApp && !$this->filled('alert_message')) {
                $validator->errors()->add('alert_message', 'Mensagem do alerta e obrigatoria para canal alert_app.');
            }
        });
    }
}
