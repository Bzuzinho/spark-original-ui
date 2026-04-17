import {
  PermissionSelectionState,
  PermissionTreeNodeData,
  TreeCheckState,
  UserTypeAccessPermission,
} from '@/types/access-control';

type PermissionNodeMap = Record<string, PermissionTreeNodeData>;

export function createEmptyPermissionSelectionState(): PermissionSelectionState {
  return {
    view: new Set<string>(),
    edit: new Set<string>(),
    delete: new Set<string>(),
  };
}

export function createPermissionNodeMap(nodes: PermissionTreeNodeData[]): PermissionNodeMap {
  const nodeMap: PermissionNodeMap = {};

  const walk = (items: PermissionTreeNodeData[]) => {
    items.forEach((item) => {
      nodeMap[item.id] = item;
      walk(item.children);
    });
  };

  walk(nodes);

  return nodeMap;
}

export function collectExpandableNodeIds(nodes: PermissionTreeNodeData[], maxDepth = 1): string[] {
  const expandedIds: string[] = [];

  const walk = (items: PermissionTreeNodeData[], depth: number) => {
    items.forEach((item) => {
      if (item.children.length > 0 && depth <= maxDepth) {
        expandedIds.push(item.id);
      }

      walk(item.children, depth + 1);
    });
  };

  walk(nodes, 0);

  return expandedIds;
}

export function mapPermissionsToSelectionState(
  permissions: UserTypeAccessPermission[],
): PermissionSelectionState {
  const nextState = createEmptyPermissionSelectionState();

  permissions.forEach((permission) => {
    if (permission.can_view) {
      nextState.view.add(permission.permission_node_id);
    }

    if (permission.can_edit) {
      nextState.edit.add(permission.permission_node_id);
    }

    if (permission.can_delete) {
      nextState.delete.add(permission.permission_node_id);
    }
  });

  return nextState;
}

export function buildPermissionsPayload(selectionState: PermissionSelectionState): UserTypeAccessPermission[] {
  const allNodeIds = new Set<string>([
    ...selectionState.view,
    ...selectionState.edit,
    ...selectionState.delete,
  ]);

  return Array.from(allNodeIds)
    .sort()
    .map((permissionNodeId) => ({
      permission_node_id: permissionNodeId,
      can_view: selectionState.view.has(permissionNodeId),
      can_edit: selectionState.edit.has(permissionNodeId),
      can_delete: selectionState.delete.has(permissionNodeId),
    }));
}

export function orderModuleKeys(keys: string[], orderedModuleKeys: string[]): string[] {
  const keySet = new Set(keys);
  return orderedModuleKeys.filter((key) => keySet.has(key));
}

export function togglePermissionBranch(
  currentSelection: Set<string>,
  nodeId: string,
  checked: boolean,
  nodeMap: PermissionNodeMap,
): Set<string> {
  const nextSelection = new Set(currentSelection);
  const branchIds = getBranchNodeIds(nodeId, nodeMap);

  branchIds.forEach((branchId) => {
    if (checked) {
      nextSelection.add(branchId);
      return;
    }

    nextSelection.delete(branchId);
  });

  return nextSelection;
}

export function getNodeCheckState(
  nodeId: string,
  selectedIds: Set<string>,
  nodeMap: PermissionNodeMap,
): TreeCheckState {
  const branchIds = getBranchNodeIds(nodeId, nodeMap);
  const selectedCount = branchIds.filter((branchId) => selectedIds.has(branchId)).length;

  if (selectedCount === 0) {
    return 'unchecked';
  }

  if (selectedCount === branchIds.length) {
    return 'checked';
  }

  return 'indeterminate';
}

function getBranchNodeIds(nodeId: string, nodeMap: PermissionNodeMap): string[] {
  const node = nodeMap[nodeId];

  if (!node) {
    return [];
  }

  return [node.id, ...collectDescendantIds(node)];
}

function collectDescendantIds(node: PermissionTreeNodeData): string[] {
  return node.children.flatMap((child) => [child.id, ...collectDescendantIds(child)]);
}