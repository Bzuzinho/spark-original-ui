<?php

namespace Database\Seeders;

use App\Services\AccessControl\PermissionNodeSyncService;
use Illuminate\Database\Seeder;

class PermissionNodeSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionNodeSyncService::class)->sync();
    }
}