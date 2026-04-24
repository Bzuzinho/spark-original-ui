<?php

namespace Tests\Feature\AccessControl;

use App\Models\PermissionNode;
use App\Models\UserType;
use App\Services\AccessControl\PermissionNodeSyncService;
use App\Services\AccessControl\UserTypeAccessControlService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SyncUserTypePermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_permissions_persists_legacy_and_node_columns(): void
    {
        $userType = UserType::query()->create([
            'codigo' => 'atleta',
            'nome' => 'Atleta',
            'ativo' => true,
        ]);

        app(PermissionNodeSyncService::class)->sync();

        $permissionNodeId = PermissionNode::query()
            ->where('key', 'membros.ficha.comunicacoes')
            ->value('id');

        $this->assertNotNull($permissionNodeId);

        $settings = app(UserTypeAccessControlService::class)->syncPermissions($userType, [
            [
                'permission_node_id' => $permissionNodeId,
                'can_view' => true,
                'can_edit' => false,
                'can_delete' => false,
            ],
        ]);

        $this->assertSame($userType->id, $settings['userType']['id']);

        $this->assertDatabaseHas('user_type_permissions', [
            'user_type_id' => $userType->id,
            'permission_node_id' => $permissionNodeId,
            'modulo' => 'membros',
            'submodulo' => 'ficha',
            'separador' => 'comunicacoes',
            'campo' => null,
            'can_view' => true,
            'can_edit' => false,
            'can_delete' => false,
            'pode_ver' => true,
            'pode_criar' => false,
            'pode_editar' => false,
            'pode_eliminar' => false,
        ]);
    }
}