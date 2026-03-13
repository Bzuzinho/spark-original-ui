import { Badge } from '@/Components/ui/badge';
import type { TeamResult } from '@/types/sports';

interface TeamResultsTableProps {
  teamResults: TeamResult[];
}

export function TeamResultsTable({ teamResults }: TeamResultsTableProps) {
  if (teamResults.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      {teamResults.map((row) => (
        <div key={row.id} className="flex items-center gap-2 border rounded-md px-2 py-1.5 text-xs">
          <span className="flex-1 truncate font-medium">{row.equipa}</span>
          {row.pontos != null && (
            <Badge variant="secondary" className="text-[10px]">
              {row.pontos} pts
            </Badge>
          )}
          {row.classificacao != null && (
            <Badge variant="outline" className="text-[10px]">
              #{row.classificacao}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}
