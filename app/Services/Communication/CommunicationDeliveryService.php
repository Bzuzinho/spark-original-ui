<?php

namespace App\Services\Communication;

use App\Models\CommunicationCampaign;
use App\Models\CommunicationCampaignChannel;
use App\Models\CommunicationDelivery;
use App\Models\CommunicationDeliveryRecipient;
use Illuminate\Support\Facades\Log;

class CommunicationDeliveryService
{
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

            $rendered = $this->templateRenderService->renderChannelContent($channel, [
                'nome' => $recipient['name'] ?? 'Utilizador',
            ]);

            $sent = $this->simulateSendByChannel($channel->channel, $recipient, $rendered['subject'], $rendered['body']);

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

        if ($channel->channel === 'alert_app' || $campaign->create_in_app_alert) {
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

    private function simulateSendByChannel(string $channel, array $recipient, ?string $subject, ?string $body): bool
    {
        try {
            return match ($channel) {
                'email' => !empty($recipient['email']),
                'sms' => !empty($recipient['phone']),
                'push' => !empty($recipient['push_token']),
                'interno' => !empty($recipient['user_id']),
                'alert_app' => !empty($recipient['user_id']),
                default => false,
            };
        } catch (\Throwable $exception) {
            Log::error('CommunicationDeliveryService::simulateSendByChannel', [
                'channel' => $channel,
                'recipient' => $recipient,
                'subject' => $subject,
                'error' => $exception->getMessage(),
            ]);

            return false;
        }
    }
}
