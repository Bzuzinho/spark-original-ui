<?php

namespace App\Observers;

use App\Models\Movement;
use App\Services\Communication\CommunicationAutomationService;

class MovementObserver
{
    public function created(Movement $movement): void
    {
        app(CommunicationAutomationService::class)->triggerMovementIssued($movement);
    }
}