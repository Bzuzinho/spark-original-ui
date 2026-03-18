import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import type { User } from '@/Components/Desportivo/types';

type PresenceState = 'presente' | 'ausente' | 'dispensado';

interface PresenceGroup {
  id: string;
  user_id: string;
  nome_atleta: string;
  estado: string;
}

interface Props {
  training_id: string;
  presences: PresenceGroup[];
  athletes: User[];
  onAddAthlete: (athlete_id: string) => void;
  onRemoveAthlete: (presence_id: string) => void;
  onUpdatePresence: (user_id: string, status: PresenceState) => void;
}

function mapStateToPresenceState(estado: string): PresenceState | null {
  if (estado === 'presente') return 'presente';
  if (estado === 'ausente') return 'ausente';
  if (estado === 'justificado' || estado === 'atestado_medico' || estado === 'dispensado') return 'dispensado';
  return null;
}

const STATUS_OPTIONS: Array<{
  value: PresenceState;
  label: string;
  shortLabel: 'P' | 'A' | 'D';
  activeClassName: string;
}> = [
  {
    value: 'presente',
    label: 'Presente',
    shortLabel: 'P',
    activeClassName: 'bg-green-100 text-green-800 border-green-300',
  },
  {
    value: 'ausente',
    label: 'Ausente',
    shortLabel: 'A',
    activeClassName: 'bg-red-100 text-red-800 border-red-300',
  },
  {
    value: 'dispensado',
    label: 'Dispensado',
    shortLabel: 'D',
    activeClassName: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
];

export function CaisPresencesGroup({
  training_id,
  presences,
  athletes,
  onAddAthlete,
  onRemoveAthlete,
  onUpdatePresence,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [newAthleteId, setNewAthleteId] = useState('');

  const presenceIds = new Set(presences.map((p) => p.user_id));
  const availableAthletes = athletes.filter((a) => !presenceIds.has(a.id));

  const apresenteCount = presences.filter((p) => mapStateToPresenceState(p.estado) === 'presente').length;
  const ausenteCount = presences.filter((p) => mapStateToPresenceState(p.estado) === 'ausente').length;
  const dispensadoCount = presences.filter((p) => mapStateToPresenceState(p.estado) === 'dispensado').length;

  return (
    <Card className="border gap-0 py-3">
      <CardHeader
        className="px-4 pb-0 gap-0 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <CardTitle className="text-xs">
              Presencas
            </CardTitle>
            {!expanded && (
              <div className="flex gap-1 flex-wrap">
                {apresenteCount > 0 && <Badge variant="outline" className="bg-green-100 text-green-800 text-[10px]">P {apresenteCount}</Badge>}
                {ausenteCount > 0 && <Badge variant="outline" className="bg-red-100 text-red-800 text-[10px]">A {ausenteCount}</Badge>}
                {dispensadoCount > 0 && <Badge variant="outline" className="bg-yellow-100 text-yellow-800 text-[10px]">D {dispensadoCount}</Badge>}
              </div>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-2 px-4 pt-[2px]">
          {/* Add Athlete Section */}
          <div className="flex gap-1 pb-2">
            <Select value={newAthleteId} onValueChange={setNewAthleteId}>
              <SelectTrigger className="h-7 text-[11px]">
                <SelectValue placeholder="Adicionar atleta..." />
              </SelectTrigger>
              <SelectContent>
                {availableAthletes.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-[11px]">
                    {a.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2"
              onClick={() => {
                if (newAthleteId) {
                  onAddAthlete(newAthleteId);
                  setNewAthleteId('');
                }
              }}
              disabled={!newAthleteId}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Athletes List */}
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {presences.length === 0 ? (
              <p className="text-[11px] text-muted-foreground py-2">Sem atletas agendados</p>
            ) : (
              presences.map((presence) => (
                <div
                  key={presence.id}
                  className="flex items-center justify-between gap-1 p-1.5 rounded border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-[11px] truncate">{presence.nome_atleta}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {STATUS_OPTIONS.map((statusOption) => {
                      const selectedState = mapStateToPresenceState(presence.estado);
                      const isSelected = selectedState === statusOption.value;

                      return (
                        <button
                          key={statusOption.value}
                          type="button"
                          className={`inline-flex h-6 w-6 items-center justify-center rounded border transition-colors ${
                            isSelected
                              ? statusOption.activeClassName
                              : 'border-border text-muted-foreground hover:bg-muted'
                          }`}
                          onClick={() => onUpdatePresence(presence.user_id, statusOption.value)}
                          title={statusOption.label}
                          aria-label={statusOption.label}
                        >
                          <span className="text-[10px] font-semibold leading-none">{statusOption.shortLabel}</span>
                        </button>
                      );
                    })}

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => onRemoveAthlete(presence.id)}
                      title="Remover atleta"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
