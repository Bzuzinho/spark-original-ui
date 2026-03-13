import { Badge } from '@/Components/ui/badge';
import { CompactStatusButton } from '@/components/sports/shared';

type CaisStatus = 'presente' | 'ausente' | 'dispensado';

interface Props {
  name: string;
  status: CaisStatus | null;
  disabled?: boolean;
  compact?: boolean;
  onSetStatus: (status: CaisStatus) => void;
  onOpenDetail: () => void;
}

const STATUS_STYLE: Record<CaisStatus, string> = {
  presente: 'bg-emerald-500 text-white',
  ausente: 'bg-red-500 text-white',
  dispensado: 'bg-slate-500 text-white',
};

export function CaisAthleteRow({
  name,
  status,
  disabled = false,
  compact = false,
  onSetStatus,
  onOpenDetail,
}: Props) {
  const sizeClass = compact ? 'w-7 h-7 text-[10px]' : 'w-8 h-8 text-[11px]';

  return (
    <div
      className="flex items-center gap-2 border rounded-md px-2 py-1.5"
      role="button"
      tabIndex={0}
      onClick={onOpenDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetail();
        }
      }}
    >
      <button
        type="button"
        className="text-xs font-medium truncate flex-1 text-left"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetail();
        }}
      >
        {name}
      </button>

      {status && (
        <Badge variant="outline" className="text-[10px] shrink-0">
          {status}
        </Badge>
      )}

      <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        {([
          ['P', 'presente'],
          ['A', 'ausente'],
          ['D', 'dispensado'],
        ] as const).map(([label, key]) => (
          <CompactStatusButton
            key={key}
            label={label}
            title={key}
            isActive={status === key}
            activeClassName={STATUS_STYLE[key]}
            sizeClassName={sizeClass}
            disabled={disabled}
            onClick={() => onSetStatus(key)}
          />
        ))}
      </div>
    </div>
  );
}
