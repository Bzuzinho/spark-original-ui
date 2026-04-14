<?php

namespace App\Observers;

use App\Models\SupplierPurchase;
use App\Services\Communication\CommunicationAutomationService;

class SupplierPurchaseObserver
{
    public function created(SupplierPurchase $supplierPurchase): void
    {
        app(CommunicationAutomationService::class)->triggerSupplierPurchaseCreated($supplierPurchase);
    }
}