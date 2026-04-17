import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import {
  collectExpandableNodeIds,
  createPermissionNodeMap,
  getNodeCheckState,
} from '@/lib/access-control';
import { PermissionTreeNode } from '@/Components/Configuracoes/Permissions/PermissionTreeNode';
import { PermissionTreeNodeData } from '@/types/access-control';

interface PermissionTreeProps {
  title: string;
  description: string;
  nodes: PermissionTreeNodeData[];
  selectedIds: Set<string>;
  onToggleNode: (nodeId: string, checked: boolean) => void;
}

export function PermissionTree({ title, description, nodes, selectedIds, onToggleNode }: PermissionTreeProps) {
  const nodeMap = useMemo(() => createPermissionNodeMap(nodes), [nodes]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(collectExpandableNodeIds(nodes)),
  );

  useEffect(() => {
    setExpandedIds(new Set(collectExpandableNodeIds(nodes)));
  }, [nodes]);

  const handleToggleExpanded = (nodeId: string) => {
    setExpandedIds((currentExpandedIds) => {
      const nextExpandedIds = new Set(currentExpandedIds);

      if (nextExpandedIds.has(nodeId)) {
        nextExpandedIds.delete(nodeId);
      } else {
        nextExpandedIds.add(nodeId);
      }

      return nextExpandedIds;
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[640px] space-y-1 overflow-y-auto pr-1">
          {nodes.map((node) => (
            <PermissionTreeNode
              key={node.id}
              node={node}
              depth={0}
              expandedIds={expandedIds}
              onToggleExpanded={handleToggleExpanded}
              onToggleSelection={onToggleNode}
              getCheckState={(nodeId) => getNodeCheckState(nodeId, selectedIds, nodeMap)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}