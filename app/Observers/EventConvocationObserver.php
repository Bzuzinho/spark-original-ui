<?php

namespace App\Observers;

use App\Models\EventConvocation;
use App\Services\Communication\CommunicationAutomationService;

class EventConvocationObserver
{
    public function created(EventConvocation $convocation): void
    {
        app(CommunicationAutomationService::class)->triggerEventConvocationCreated($convocation);
    }
}