<?php

namespace App\Console\Commands;

use App\Services\Communication\CommunicationAutomationService;
use Illuminate\Console\Command;

class ReleaseVisibleInvoiceCommunications extends Command
{
    protected $signature = 'comunicacao:libertar-alertas-faturas';

    protected $description = 'Envia comunicacoes automaticas de faturas que entretanto se tornaram visiveis';

    public function handle(CommunicationAutomationService $automationService): int
    {
        $released = $automationService->releaseVisibleInvoiceCommunications();

        $this->info(sprintf('Comunicacoes de faturas libertadas: %d', $released));

        return self::SUCCESS;
    }
}