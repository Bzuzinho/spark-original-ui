<?php

namespace App\Observers;

use App\Models\LogisticsRequest;
use App\Services\Communication\CommunicationAutomationService;

class LogisticsRequestObserver
{
    public function created(LogisticsRequest $logisticsRequest): void
    {
        app(CommunicationAutomationService::class)->triggerLogisticsRequestCreated($logisticsRequest);
    }

    public function updated(LogisticsRequest $logisticsRequest): void
    {
        if (!$logisticsRequest->wasChanged('status')) {
            return;
        }

        $fromStatus = (string) $logisticsRequest->getOriginal('status');
        $toStatus = (string) $logisticsRequest->status;

        app(CommunicationAutomationService::class)->triggerLogisticsRequestStatusChanged($logisticsRequest, $fromStatus, $toStatus);
    }
}