import { Badge } from '@/Components/ui/badge';
import type { CompetitionResult } from '@/types/sports';

interface CompetitionResultsTableProps {
  eventTitle: string;
  results: CompetitionResult[];
  bestByProva: Record<string, number>;
}

function formatTime(t: string | null | undefined): string {
  if (!t) return '—';
  return t;
}

function toSeconds(value: string | null | undefined): number | null {
  if (!value) return null;
  const parts = value.split(':');
  if (parts.length === 2) {
    const min = Number(parts[0]);
    const sec = Number(parts[1]);
    if (!Number.isNaN(min) && !Number.isNaN(sec)) return min * 60 + sec;
  }
  const sec = Number(value);
  return Number.isNaN(sec) ? null : sec;
}

function formatDelta(seconds: number | null): string {
  if (seconds == null) return '—';
  return `${seconds > 0 ? '+' : ''}${seconds.toFixed(2)}s`;
}

export function CompetitionResultsTable({ eventTitle, results, bestByProva }: CompetitionResultsTableProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{eventTitle}</p>
      {results.map((row) => (
        <div
          key={row.id}
          className="flex items-center gap-2 text-xs border-b last:border-0 pb-1 last:pb-0"
        >
          <span className="flex-1 truncate">{row.athlete?.nome_completo ?? '—'}</span>
          <span className="text-muted-foreground shrink-0">{row.prova}</span>
          <span className="font-mono shrink-0">{formatTime(row.tempo)}</span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            Δ {formatDelta((toSeconds(row.tempo) ?? 0) - (bestByProva[row.prova] ?? 0))}
          </span>
          {row.classificacao != null && (
            <Badge variant="outline" className="text-[10px] shrink-0">
              #{row.classificacao}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}
