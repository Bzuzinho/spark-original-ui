import { useMemo, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/Components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { CaisAthleteRow } from '@/Components/Desportivo/components/cais/CaisAthleteRow';
import { CaisAthletePerformanceModal } from '@/Components/Desportivo/components/cais/CaisAthletePerformanceModal';
import type { CaisPerformanceRow, PresenceRow, Training, User } from '@/Components/Desportivo/types';

type CaisStatus = 'presente' | 'ausente' | 'dispensado';

interface Props {
  training: Training | null;
  athletes: User[];
  presences: PresenceRow[];
  quickMode: boolean;
  onUpdatePresence: (userId: string, status: CaisStatus) => void;
}

function mapPresenceToCaisStatus(status: string | undefined): CaisStatus | null {
  if (!status) return null;
  if (status === 'presente') return 'presente';
  if (status === 'ausente') return 'ausente';
  if (status === 'justificado' || status === 'atestado_medico') return 'dispensado';
  return null;
}

export function CaisAthleteAttendanceList({ training, athletes, presences, quickMode, onUpdatePresence }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [performanceByAthlete, setPerformanceByAthlete] = useState<Record<string, CaisPerformanceRow[]>>({});

  const getCsrfToken = () => {
    const token = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    return token?.content || '';
  };

  const loadAthletePerformance = async (athleteId: string) => {
    if (!training) return;

    try {
      const params = new URLSearchParams({ treino_id: training.id, user_id: athleteId });
      const response = await fetch(`${route('desportivo.cais.metrics.index')}?${params.toString()}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar métricas de Cais.');
      }

      const data = await response.json() as { rows?: CaisPerformanceRow[] };
      const rows = Array.isArray(data.rows) ? data.rows : [];
      setPerformanceByAthlete((prev) => ({ ...prev, [athleteId]: rows }));
    } catch (error) {
      console.error(error);
    }
  };

  const saveAthletePerformance = async (athleteId: string, rows: CaisPerformanceRow[]) => {
    if (!training) return;

    setPerformanceByAthlete((prev) => ({ ...prev, [athleteId]: rows }));

    try {
      const response = await fetch(route('desportivo.cais.metrics.store'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          treino_id: training.id,
          user_id: athleteId,
          rows,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao guardar métricas de Cais.');
      }

      const data = await response.json() as { rows?: CaisPerformanceRow[] };
      const persistedRows = Array.isArray(data.rows) ? data.rows : rows;
      setPerformanceByAthlete((prev) => ({ ...prev, [athleteId]: persistedRows }));
    } catch (error) {
      console.error(error);
    }
  };

  const summary = useMemo(() => {
    const counters = { presente: 0, ausente: 0, dispensado: 0 };
    athletes.forEach((athlete) => {
      const row = presences.find((p) => p.user_id === athlete.id);
      const status = mapPresenceToCaisStatus(row?.status);
      if (status) counters[status] += 1;
    });
    return counters;
  }, [athletes, presences]);

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId) || null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">Container de atletas</CardTitle>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-[10px]">P {summary.presente}</Badge>
            <Badge variant="outline" className="text-[10px]">A {summary.ausente}</Badge>
            <Badge variant="outline" className="text-[10px]">D {summary.dispensado}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger asChild>
            <button type="button" className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground">
              {expanded ? 'Minimizar atletas' : 'Expandir atletas'} ({athletes.length})
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1.5 mt-2">
            {athletes.length === 0 && <p className="text-xs text-muted-foreground">Sem atletas elegíveis para este treino.</p>}
            {athletes.map((athlete) => {
              const presence = presences.find((p) => p.user_id === athlete.id);
              const status = mapPresenceToCaisStatus(presence?.status);
              return (
                <CaisAthleteRow
                  key={athlete.id}
                  name={athlete.nome_completo}
                  status={status}
                  compact={quickMode}
                  onSetStatus={(nextStatus) => onUpdatePresence(athlete.id, nextStatus)}
                  onOpenDetail={() => {
                    setSelectedAthleteId(athlete.id);
                    void loadAthletePerformance(athlete.id);
                  }}
                />
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <CaisAthletePerformanceModal
        open={Boolean(selectedAthleteId)}
        athlete={selectedAthlete}
        training={training}
        initialRows={selectedAthleteId ? (performanceByAthlete[selectedAthleteId] ?? []) : []}
        onClose={() => setSelectedAthleteId(null)}
        onSave={(rows) => {
          if (!selectedAthleteId) return;
          void saveAthletePerformance(selectedAthleteId, rows);
        }}
      />
    </Card>
  );
}
