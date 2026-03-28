<?php

namespace App\Jobs;

use App\Models\CommunicationCampaign;
use App\Services\Communication\CommunicationCampaignService;
use App\Services\Communication\CommunicationDeliveryService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessCommunicationCampaignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly string $campaignId,
        public readonly ?string $executedBy = null
    ) {
    }

    public function handle(CommunicationDeliveryService $deliveryService, CommunicationCampaignService $campaignService): void
    {
        $campaign = CommunicationCampaign::with(['channels', 'segment', 'deliveries'])->find($this->campaignId);

        if (!$campaign) {
            return;
        }

        foreach ($campaign->channels->where('is_enabled', true) as $channel) {
            $deliveryService->createAndExecuteDelivery($campaign, $channel, $this->executedBy);
        }

        $campaignService->consolidateStatus($campaign->refresh());
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessCommunicationCampaignJob failed', [
            'campaign_id' => $this->campaignId,
            'error' => $exception->getMessage(),
        ]);

        CommunicationCampaign::where('id', $this->campaignId)->update([
            'status' => 'falhada',
            'notes' => 'Falha no processamento: ' . $exception->getMessage(),
        ]);
    }
}
