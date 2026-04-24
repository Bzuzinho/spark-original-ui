<?php

namespace App\Services\AccessControl;

use App\Models\PermissionNode;
use App\Support\AccessControl\AccessControlCatalog;

class PermissionNodeSyncService
{
    public function sync(): int
    {
        $definitions = AccessControlCatalog::permissionTree();
        $sortOrder = 1;
        $syncedKeys = [];

        $syncNodes = function (array $nodes, ?PermissionNode $parent = null) use (&$syncNodes, &$sortOrder, &$syncedKeys): void {
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

                $syncedKeys[] = $node->key;

                $syncNodes($nodeDefinition['children'] ?? [], $node);
            }
        };

        $syncNodes($definitions);

        PermissionNode::query()
            ->whereNotIn('key', $syncedKeys)
            ->update(['active' => false]);

        return count($syncedKeys);
    }
}