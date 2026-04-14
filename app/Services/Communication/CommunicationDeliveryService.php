<?php

namespace App\Services\Communication;

use App\Models\AgeGroup;
use App\Models\CommunicationCampaign;
use App\Models\CommunicationCampaignChannel;
use App\Models\CommunicationDelivery;
use App\Models\CommunicationDeliveryRecipient;
use App\Models\Event;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

class CommunicationDeliveryService
{
    private ?bool $usersHaveAgeGroupColumn = null;

    public function __construct(
        private readonly SegmentResolverService $segmentResolverService,
        private readonly TemplateRenderService $templateRenderService,
        private readonly InAppAlertService $inAppAlertService
    ) {
    }

    public function createAndExecuteDelivery(CommunicationCampaign $campaign, CommunicationCampaignChannel $channel, ?string $executedBy = null): CommunicationDelivery
    {
        $recipients = $this->segmentResolverService->resolveRecipients($campaign->segment, $channel->channel);

        $delivery = CommunicationDelivery::create([
            'campaign_id' => $campaign->id,
            'channel' => $channel->channel,
            'segment_id' => $campaign->segment_id,
            'status' => 'processing',
            'scheduled_at' => $campaign->scheduled_at,
            'executed_by' => $executedBy,
            'total_recipients' => $recipients->count(),
            'pending_count' => $recipients->count(),
        ]);

        if ($recipients->isEmpty()) {
            $delivery->update([
                'status' => 'failed',
                'error_message' => 'Sem destinatarios validos para o canal selecionado.',
                'pending_count' => 0,
                'result_summary' => 'Nenhum destinatario resolvido.',
            ]);

            return $delivery;
        }

        $successCount = 0;
        $failedCount = 0;

        foreach ($recipients as $recipient) {
            $recipientRow = CommunicationDeliveryRecipient::create([
                'delivery_id' => $delivery->id,
                'user_id' => $recipient['user_id'] ?? null,
                'member_id' => $recipient['member_id'] ?? null,
                'contact_email' => $recipient['email'] ?? null,
                'contact_phone' => $recipient['phone'] ?? null,
                'push_token' => $recipient['push_token'] ?? null,
                'status' => 'pending',
            ]);

            $rendered = $this->templateRenderService->renderChannelContent(
                $channel,
                $this->buildTemplateVariables($campaign, $channel, $recipient)
            );

            $sent = $this->sendByChannel($channel->channel, $recipient, $rendered['subject'], $rendered['body']);

            if ($sent) {
                $successCount++;
                $recipientRow->update([
                    'status' => in_array($channel->channel, ['interno', 'alert_app'], true) ? 'delivered' : 'sent',
                    'sent_at' => now(),
                    'delivered_at' => now(),
                ]);
            } else {
                $failedCount++;
                $recipientRow->update([
                    'status' => 'failed',
                    'error_message' => 'Destinatario sem dados compativeis com o canal.',
                ]);
            }
        }

        if ($this->shouldCreateInAppAlerts($campaign, $channel)) {
            $this->inAppAlertService->createAlerts([
                'campaign_id' => $campaign->id,
                'delivery_id' => $delivery->id,
                'title' => $campaign->alert_title ?: $campaign->title,
                'message' => $campaign->alert_message ?: ($channel->message_body ?: $campaign->description ?: 'Nova comunicacao disponivel.'),
                'link' => $campaign->alert_link,
                'type' => $campaign->alert_type ?: 'info',
            ], $recipients);
        }

        $pendingCount = max(0, $delivery->total_recipients - $successCount - $failedCount);
        $status = $failedCount === 0 ? 'completed' : ($successCount > 0 ? 'partial' : 'failed');

        $delivery->update([
            'status' => $status,
            'sent_at' => now(),
            'success_count' => $successCount,
            'failed_count' => $failedCount,
            'pending_count' => $pendingCount,
            'result_summary' => sprintf('Sucesso: %d | Falhas: %d', $successCount, $failedCount),
        ]);

        return $delivery;
    }

    private function sendByChannel(string $channel, array $recipient, ?string $subject, ?string $body): bool
    {
        try {
            return match ($channel) {
                'email' => $this->sendEmail($recipient['email'] ?? null, $subject, $body),
                'sms' => $this->sendSms($recipient['phone'] ?? null, $body),
                'push' => !empty($recipient['push_token']),
                'interno' => !empty($recipient['user_id']),
                'alert_app' => !empty($recipient['user_id']),
                default => false,
            };
        } catch (\Throwable $exception) {
            Log::error('CommunicationDeliveryService::sendByChannel', [
                'channel' => $channel,
                'recipient' => $recipient,
                'subject' => $subject,
                'error' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    private function sendEmail(?string $email, ?string $subject, ?string $body): bool
    {
        if (empty($email)) {
            return false;
        }

        Mail::raw($body ?: '', function ($message) use ($email, $subject) {
            $message->to($email)
                ->subject($subject ?: 'Comunicacao ClubOS');
        });

        return true;
    }

    private function sendSms(?string $phone, ?string $body): bool
    {
        if (empty($phone) || empty($body)) {
            return false;
        }

        $enabled = (bool) config('services.sms.enabled', false);
        $apiUrl = (string) config('services.sms.api_url', '');
        $token = (string) config('services.sms.token', '');
        $sender = (string) config('services.sms.sender', '');

        if (!$enabled || $apiUrl === '' || $token === '') {
            Log::warning('SMS provider not configured. Set SMS_ENABLED, SMS_API_URL and SMS_API_TOKEN.');
            return false;
        }

        $response = Http::withToken($token)
            ->acceptJson()
            ->asJson()
            ->post($apiUrl, [
                'to' => $phone,
                'message' => $body,
                'from' => $sender,
            ]);

        if (!$response->successful()) {
            Log::error('SMS delivery failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }

        return $response->successful();
    }

    private function shouldCreateInAppAlerts(CommunicationCampaign $campaign, CommunicationCampaignChannel $channel): bool
    {
        if ($channel->channel === 'alert_app') {
            return !$campaign->inAppAlerts()->exists();
        }

        if (!$campaign->create_in_app_alert) {
            return false;
        }

        if ($campaign->channels()->where('channel', 'alert_app')->where('is_enabled', true)->exists()) {
            return false;
        }

        return !$campaign->inAppAlerts()->exists();
    }

    private function buildTemplateVariables(CommunicationCampaign $campaign, CommunicationCampaignChannel $channel, array $recipient): array
    {
        $user = !empty($recipient['user_id'])
            ? User::query()->find($recipient['user_id'])
            : null;
        $latestInvoice = $user
            ? Invoice::query()
                ->where('user_id', $user->id)
                ->latest('data_vencimento')
                ->latest('created_at')
                ->first()
            : null;
        $latestEvent = $this->resolveContextEvent($campaign, $user);
        $ageGroupName = $this->resolvePrimaryAgeGroupName($user);
        $userTypes = collect($user?->tipo_membro ?? [])->filter()->implode(', ');
        $phone = $user?->telemovel ?: $user?->contacto_telefonico ?: $user?->contacto;

        return [
            'nome' => $user?->nome_completo ?: $recipient['name'] ?? 'Utilizador',
            'nome_atleta' => $user?->nome_completo ?: $recipient['name'] ?? 'Utilizador',
            'nome_utilizador' => $user?->name ?: $user?->nome_completo ?: $recipient['name'] ?? 'Utilizador',
            'numero_socio' => $user?->numero_socio ?: '',
            'email' => $user?->email ?: $recipient['email'] ?? '',
            'telemovel' => $phone ?: $recipient['phone'] ?? '',
            'tipos_utilizador' => $userTypes,
            'escalao' => $ageGroupName,
            'titulo_comunicacao' => $channel->subject ?: $campaign->title,
            'titulo_alerta' => $campaign->alert_title ?: '',
            'mensagem_alerta' => $campaign->alert_message ?: ($channel->message_body ?: $campaign->description ?: ''),
            'mes' => $latestInvoice?->mes ?: '',
            'valor' => $latestInvoice?->valor_total !== null ? (string) $latestInvoice->valor_total : '',
            'valor_em_divida' => $latestInvoice && $latestInvoice->estado_pagamento !== 'pago' ? (string) $latestInvoice->valor_total : '',
            'data_vencimento' => $latestInvoice?->data_vencimento?->format('Y-m-d') ?: '',
            'evento_nome' => $latestEvent?->titulo ?: '',
            'evento_data' => $latestEvent?->data_inicio?->format('Y-m-d') ?: '',
            'evento_local' => $latestEvent?->local ?: '',
        ];
    }

    private function resolvePrimaryAgeGroupName(?User $user): string
    {
        if (!$user) {
            return '';
        }

        if ($this->usersHaveAgeGroupColumn()) {
            $ageGroupId = $user->getAttribute('age_group_id');

            if ($ageGroupId) {
                return (string) optional(AgeGroup::query()->find($ageGroupId))->nome;
            }
        }

        $rawAgeGroupId = is_array($user->escalao ?? null) ? ($user->escalao[0] ?? null) : null;
        if (!$rawAgeGroupId) {
            return '';
        }

        return (string) optional(AgeGroup::query()->find($rawAgeGroupId))->nome;
    }

    private function usersHaveAgeGroupColumn(): bool
    {
        return $this->usersHaveAgeGroupColumn ??= Schema::hasColumn('users', 'age_group_id');
    }

    private function resolveContextEvent(CommunicationCampaign $campaign, ?User $user): ?Event
    {
        $eventId = $campaign->segment?->rules_json['event_id'] ?? null;
        if ($eventId) {
            return Event::query()->find($eventId);
        }

        if (!$user) {
            return null;
        }

        return $user->eventAttendances()->latest('created_at')->first()?->event;
    }
}
