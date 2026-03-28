<?php

namespace App\Services\Communication;

use App\Jobs\ProcessCommunicationCampaignJob;
use App\Models\CommunicationCampaign;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CommunicationCampaignService
{
    public function __construct(private readonly CommunicationDeliveryService $deliveryService)
    {
    }

    public function createCampaign(array $payload, ?string $authorId = null): CommunicationCampaign
    {
        return DB::transaction(function () use ($payload, $authorId) {
            $campaign = CommunicationCampaign::create([
                'codigo' => $payload['codigo'] ?? $this->generateCode(),
                'title' => $payload['title'],
                'description' => $payload['description'] ?? null,
                'segment_id' => $payload['segment_id'] ?? null,
                'author_id' => $authorId,
                'status' => $payload['status'] ?? 'rascunho',
                'scheduled_at' => $payload['scheduled_at'] ?? null,
                'create_in_app_alert' => (bool) ($payload['create_in_app_alert'] ?? false),
                'alert_title' => $payload['alert_title'] ?? null,
                'alert_message' => $payload['alert_message'] ?? null,
                'alert_link' => $payload['alert_link'] ?? null,
                'alert_type' => $payload['alert_type'] ?? 'info',
                'notes' => $payload['notes'] ?? null,
            ]);

            foreach ($payload['channels'] as $channel) {
                $campaign->channels()->create([
                    'channel' => $channel['channel'],
                    'template_id' => $channel['template_id'] ?? null,
                    'subject' => $channel['subject'] ?? null,
                    'message_body' => $channel['message_body'] ?? null,
                    'is_enabled' => (bool) ($channel['is_enabled'] ?? true),
                ]);
            }

            return $campaign->load(['channels', 'segment']);
        });
    }

    public function updateCampaign(CommunicationCampaign $campaign, array $payload): CommunicationCampaign
    {
        return DB::transaction(function () use ($campaign, $payload) {
            $campaign->update([
                'title' => $payload['title'],
                'description' => $payload['description'] ?? null,
                'segment_id' => $payload['segment_id'] ?? null,
                'status' => $payload['status'] ?? $campaign->status,
                'scheduled_at' => $payload['scheduled_at'] ?? $campaign->scheduled_at,
                'create_in_app_alert' => (bool) ($payload['create_in_app_alert'] ?? false),
                'alert_title' => $payload['alert_title'] ?? null,
                'alert_message' => $payload['alert_message'] ?? null,
                'alert_link' => $payload['alert_link'] ?? null,
                'alert_type' => $payload['alert_type'] ?? 'info',
                'notes' => $payload['notes'] ?? null,
            ]);

            if (isset($payload['channels']) && is_array($payload['channels'])) {
                $campaign->channels()->delete();

                foreach ($payload['channels'] as $channel) {
                    $campaign->channels()->create([
                        'channel' => $channel['channel'],
                        'template_id' => $channel['template_id'] ?? null,
                        'subject' => $channel['subject'] ?? null,
                        'message_body' => $channel['message_body'] ?? null,
                        'is_enabled' => (bool) ($channel['is_enabled'] ?? true),
                    ]);
                }
            }

            return $campaign->load(['channels', 'segment']);
        });
    }

    public function duplicateCampaign(CommunicationCampaign $campaign, ?string $authorId = null): CommunicationCampaign
    {
        return DB::transaction(function () use ($campaign, $authorId) {
            $duplicate = CommunicationCampaign::create([
                'codigo' => $this->generateCode(),
                'title' => $campaign->title . ' (Copia)',
                'description' => $campaign->description,
                'segment_id' => $campaign->segment_id,
                'author_id' => $authorId,
                'status' => 'rascunho',
                'create_in_app_alert' => $campaign->create_in_app_alert,
                'alert_title' => $campaign->alert_title,
                'alert_message' => $campaign->alert_message,
                'alert_link' => $campaign->alert_link,
                'alert_type' => $campaign->alert_type,
                'notes' => $campaign->notes,
            ]);

            foreach ($campaign->channels as $channel) {
                $duplicate->channels()->create([
                    'channel' => $channel->channel,
                    'template_id' => $channel->template_id,
                    'subject' => $channel->subject,
                    'message_body' => $channel->message_body,
                    'is_enabled' => $channel->is_enabled,
                ]);
            }

            return $duplicate->load(['channels', 'segment']);
        });
    }

    public function scheduleCampaign(CommunicationCampaign $campaign, string $scheduledAt): CommunicationCampaign
    {
        $campaign->update([
            'scheduled_at' => $scheduledAt,
            'status' => 'agendada',
        ]);

        return $campaign->refresh();
    }

    public function sendCampaign(CommunicationCampaign $campaign, ?string $executedBy = null, bool $dispatchToQueue = true): CommunicationCampaign
    {
        if (!$campaign->segment_id) {
            throw new \RuntimeException('Campanha sem segmento definido.');
        }

        if ($campaign->channels()->where('is_enabled', true)->count() === 0) {
            throw new \RuntimeException('Campanha sem canais ativos.');
        }

        $campaign->update([
            'status' => 'em_processamento',
        ]);

        if ($dispatchToQueue) {
            ProcessCommunicationCampaignJob::dispatch($campaign->id, $executedBy);
            return $campaign->refresh();
        }

        $campaign->load(['channels', 'segment']);
        foreach ($campaign->channels->where('is_enabled', true) as $channel) {
            $this->deliveryService->createAndExecuteDelivery($campaign, $channel, $executedBy);
        }

        return $this->consolidateStatus($campaign->refresh());
    }

    public function cancelCampaign(CommunicationCampaign $campaign): CommunicationCampaign
    {
        $campaign->update([
            'status' => 'cancelada',
        ]);

        return $campaign->refresh();
    }

    public function consolidateStatus(CommunicationCampaign $campaign): CommunicationCampaign
    {
        $deliveries = $campaign->deliveries;

        if ($deliveries->isEmpty()) {
            return $campaign;
        }

        $hasFailures = $deliveries->contains(fn ($delivery) => in_array($delivery->status, ['failed', 'partial'], true));
        $hasSuccess = $deliveries->contains(fn ($delivery) => in_array($delivery->status, ['completed', 'partial'], true));

        $status = $hasFailures && !$hasSuccess ? 'falhada' : 'enviada';

        $campaign->update([
            'status' => $status,
            'sent_at' => now(),
        ]);

        return $campaign->refresh();
    }

    private function generateCode(): string
    {
        return sprintf('CMP-%s-%s', now()->format('Ymd'), Str::upper(Str::random(5)));
    }
}
