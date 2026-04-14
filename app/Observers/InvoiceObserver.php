<?php

namespace App\Observers;

use App\Models\Invoice;
use App\Services\Communication\CommunicationAutomationService;

class InvoiceObserver
{
    public function created(Invoice $invoice): void
    {
        app(CommunicationAutomationService::class)->triggerInvoiceIssued($invoice);
    }
}