<?php

namespace App\Console\Commands;

use App\Services\AccessControl\PermissionNodeSyncService;
use Illuminate\Console\Command;

class SyncPermissionNodes extends Command
{
    protected $signature = 'access-control:sync-permission-nodes';

    protected $description = 'Synchronize permission_nodes from the access-control catalog';

    public function handle(PermissionNodeSyncService $syncService): int
    {
        $count = $syncService->sync();

        $this->info("Permission nodes synchronized: {$count}");

        return self::SUCCESS;
    }
}