import { CaretDown, CaretRight } from '@phosphor-icons/react';
import { Checkbox } from '@/Components/ui/checkbox';
import { cn } from '@/lib/utils';
import { PermissionTreeNodeData, TreeCheckState } from '@/types/access-control';

interface PermissionTreeNodeProps {
  node: PermissionTreeNodeData;
  depth: number;
  expandedIds: Set<string>;
  onToggleExpanded: (nodeId: string) => void;
  onToggleSelection: (nodeId: string, checked: boolean) => void;
  getCheckState: (nodeId: string) => TreeCheckState;
}

export function PermissionTreeNode({
  node,
  depth,
  expandedIds,
  onToggleExpanded,
  onToggleSelection,
  getCheckState,
}: PermissionTreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const checkState = getCheckState(node.id);

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/40',
          depth === 0 && 'bg-muted/30 font-medium',
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpanded(node.id)}
            className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted"
          >
            {isExpanded ? <CaretDown size={14} /> : <CaretRight size={14} />}
          </button>
        ) : (
          <span className="inline-block h-5 w-5" />
        )}

        <Checkbox
          checked={checkState === 'indeterminate' ? 'indeterminate' : checkState === 'checked'}
          onCheckedChange={(checked) => onToggleSelection(node.id, checked === true)}
        />

        <div className="min-w-0">
          <div className="text-sm text-foreground">{node.label}</div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{node.node_type}</div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {node.children.map((child) => (
            <PermissionTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggleExpanded={onToggleExpanded}
              onToggleSelection={onToggleSelection}
              getCheckState={getCheckState}
            />
          ))}
        </div>
      )}
    </div>
  );
}