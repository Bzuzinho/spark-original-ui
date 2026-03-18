import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { CaisPresencesGroup } from '@/Components/Desportivo/components/cais/CaisPresencesGroup';
import type { Training, User } from '@/Components/Desportivo/types';

type PresenceState = 'presente' | 'ausente' | 'dispensado';

interface PresenceGroup {
  id: string;
  user_id: string;
  nome_atleta: string;
  estado: string;
}

interface Props {
  training: Training;
  athletes: User[];
  presences: PresenceGroup[];
  ageGroupLabelById?: Record<string, string>;
  onClose: () => void;
  onAddAthlete: (athlete_id: string) => void;
  onRemoveAthlete: (presence_id: string) => void;
  onUpdatePresence: (user_id: string, status: PresenceState) => void;
}

function formatDate(date: string): string {
  try {
    const normalizedDate = date.includes('T') ? date.split('T')[0] : date.split(' ')[0];
    const parts = normalizedDate.split('-');

    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const day = Number(parts[2]);
      const parsed = new Date(year, month - 1, day);

      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('pt-PT', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }

    const fallback = new Date(date);
    if (!Number.isNaN(fallback.getTime())) {
      return fallback.toLocaleDateString('pt-PT', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return date;
  } catch (e) {
    return date;
  }
}

function calculateTotalDistance(series: any[] | undefined): number {
  if (!Array.isArray(series)) return 0;
  return series.reduce((sum, s) => sum + (s.distancia_total_m || 0), 0);
}

export function CaisTrainingCard({
  training,
  athletes,
  presences,
  ageGroupLabelById = {},
  onClose,
  onAddAthlete,
  onRemoveAthlete,
  onUpdatePresence,
}: Props) {
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const totalDistance = calculateTotalDistance(training.series ?? undefined);
  const hasDate = !!training.data;

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Header with Close Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <p className="text-xs font-semibold text-muted-foreground">
            {training.numero_treino || 'Treino'} · {training.tipo_treino}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted transition-colors"
          title="Fechar"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Training Summary Card */}
      <Card className="border flex flex-col gap-0 py-3">
        <CardHeader
          className="px-4 pb-0 gap-0 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setSummaryExpanded((value) => !value)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs">Resumo</CardTitle>
            {summaryExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </CardHeader>

        {summaryExpanded && (
          <CardContent className="space-y-1.5 px-4 pt-[2px]">
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="col-span-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">Data agendada</p>
                <p className="truncate">{hasDate ? formatDate(training.data!) : '-'}</p>
              </div>

              <div className="col-span-1">
                <p className="text-[10px] text-muted-foreground">Início</p>
                <p>{training.hora_inicio || '--:--'}</p>
              </div>

              <div className="col-span-1">
                <p className="text-[10px] text-muted-foreground">Fim</p>
                <p>{training.hora_fim || '--:--'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Local</p>
                <p className="truncate">{training.local || '-'}</p>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Escalões</p>
                <div className="flex gap-1 flex-wrap">
                  {Array.isArray(training.escaloes) && training.escaloes.length > 0 ? (
                    training.escaloes.map((e) => (
                      <Badge key={e} variant="secondary" className="text-[9px] px-1 py-0">
                        {ageGroupLabelById[e] ?? e}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Series List Card */}
      <Card className="border gap-0 py-3">
        <CardHeader className="px-4 pb-0 gap-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs">Séries</CardTitle>
            {totalDistance > 0 && (
              <Badge variant="secondary" className="text-[9px]">
                {totalDistance}m total
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 pt-[2px]">
          <div className="space-y-1">
            {Array.isArray(training.series) && training.series.length > 0 ? (
              training.series.map((series, idx) => (
                <div key={series.id || idx} className="text-[12px] border-l-2 border-primary pl-2 py-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium min-w-0 break-words pr-2">
                      {series.repeticoes ? `${series.repeticoes}x` : '-'}
                      {' '}
                      {series.descricao_texto || `Série ${idx + 1}`}
                    </p>
                    {(series.zona_intensidade || series.distancia_total_m) && (
                      <span className="shrink-0 text-muted-foreground">
                        {series.zona_intensidade ? `${series.zona_intensidade} ` : ''}
                        {series.distancia_total_m ? `${series.distancia_total_m}m` : ''}
                      </span>
                    )}
                  </div>
                  {series.estilo && <p className="text-[11px] text-muted-foreground mt-0.5">{series.estilo}</p>}
                  {series.observacoes && (
                    <p className="text-[11px] italic text-muted-foreground mt-0.5">{series.observacoes}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-[11px] text-muted-foreground py-2">Sem séries definidas</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Presences Group Card */}
      <CaisPresencesGroup
        training_id={training.id}
        presences={presences}
        athletes={athletes}
        onAddAthlete={onAddAthlete}
        onRemoveAthlete={onRemoveAthlete}
        onUpdatePresence={onUpdatePresence}
      />
    </div>
  );
}
