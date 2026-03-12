import { useMemo, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/Components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { CaisAthleteRow } from '@/Components/Desportivo2/components/cais/CaisAthleteRow';
import { CaisAthletePerformanceModal } from '@/Components/Desportivo2/components/cais/CaisAthletePerformanceModal';
import type { CaisPerformanceRow, PresenceRow, Training, User } from '@/Components/Desportivo2/types';

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
                  onOpenDetail={() => setSelectedAthleteId(athlete.id)}
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
          setPerformanceByAthlete((prev) => ({ ...prev, [selectedAthleteId]: rows }));
        }}
      />
    </Card>
  );
}
