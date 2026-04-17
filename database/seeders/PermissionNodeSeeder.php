<?php

namespace Database\Seeders;

use App\Models\PermissionNode;
use App\Support\AccessControl\AccessControlCatalog;
use Illuminate\Database\Seeder;

class PermissionNodeSeeder extends Seeder
{
    public function run(): void
    {
        $definitions = AccessControlCatalog::permissionTree();
        $sortOrder = 1;

        $syncNodes = function (array $nodes, ?PermissionNode $parent = null) use (&$syncNodes, &$sortOrder): void {
            foreach ($nodes as $nodeDefinition) {
                $node = PermissionNode::query()->updateOrCreate(
                    ['key' => $nodeDefinition['key']],
                    [
                        'label' => $nodeDefinition['label'],
                        'parent_id' => $parent?->id,
                        'module_key' => $nodeDefinition['module_key'],
                        'node_type' => $nodeDefinition['node_type'],
                        'sort_order' => $sortOrder++,
                        'active' => true,
                    ]
                );

                $syncNodes($nodeDefinition['children'] ?? [], $node);
            }
        };

        $syncNodes($definitions);
    }
}