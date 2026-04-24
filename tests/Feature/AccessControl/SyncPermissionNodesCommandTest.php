<?php

namespace Tests\Feature\AccessControl;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class SyncPermissionNodesCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_permission_nodes_command_populates_member_self_service_tabs(): void
    {
        Artisan::call('access-control:sync-permission-nodes');

        $this->assertDatabaseHas('permission_nodes', [
            'key' => 'membros.ficha.dashboard',
            'label' => 'Dashboard',
            'active' => true,
        ]);

        $this->assertDatabaseHas('permission_nodes', [
            'key' => 'membros.ficha.comunicacoes',
            'label' => 'Comunicações',
            'active' => true,
        ]);

        $this->assertDatabaseHas('permission_nodes', [
            'key' => 'membros.ficha.desportivo.convocatorias',
            'label' => 'Convocatórias',
            'active' => true,
        ]);
    }
}