import { useMemo } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { FloppyDisk, CheckCircle } from '@phosphor-icons/react';

interface Training {
  id: string;
  numero_treino?: string;
  data: string;
}

interface PresenceRow {
  id: string;
  user_id: string;
  nome_atleta: string;
  status: string;
  classificacao?: string | null;
  distancia_realizada_m?: number | null;
  notas?: string | null;
}

interface DesportivoPresencasProps {
  trainingOptions?: Training[];
  selectedTraining?: Training | null;
  presences?: PresenceRow[];
  statusOptions?: string[];
  classificacaoOptions?: string[];
}

export function DesportivoPresencas({
  trainingOptions = [],
  selectedTraining = null,
  presences = [],
  statusOptions = ['presente', 'ausente'],
  classificacaoOptions = [],
}: DesportivoPresencasProps) {
  const presenceForm = useForm({
    presences: presences.map((p) => ({
      id: p.id,
      status: p.status,
      distancia_realizada_m: p.distancia_realizada_m ?? null,
      classificacao: p.classificacao ?? '',
      notas: p.notas ?? '',
    })),
  });

  const presenceStats = useMemo(() => {
    const total = presenceForm.data.presences.length;
    const presentes = presenceForm.data.presences.filter(
      (p) => p.status === 'presente'
    ).length;
    return {
      total,
      presentes,
      percent: total === 0 ? 0 : Math.round((presentes / total) * 100),
    };
  }, [presenceForm.data.presences]);

  const updatePresence = (
    index: number,
    patch: Partial<(typeof presenceForm.data.presences)[number]>
  ) => {
    const next = [...presenceForm.data.presences];
    next[index] = { ...next[index], ...patch };
    presenceForm.setData('presences', next);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-base">Presenças</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle size={16} weight="duotone" className="text-emerald-600" />
            <span>
              {presenceStats.presentes}/{presenceStats.total} presentes (
              {presenceStats.percent}%)
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="training_select">Selecionar Treino</Label>
            <div className="flex gap-2 flex-wrap">
              <Select
                value={selectedTraining?.id ?? ''}
                onValueChange={(value) =>
                  router.get(route('desportivo.presencas'), { training_id: value })
                }
              >
                <SelectTrigger id="training_select" className="flex-1 min-w-[200px] bg-white">
                  <SelectValue placeholder="Selecionar treino" />
                </SelectTrigger>
                <SelectContent>
                  {trainingOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.numero_treino || 'Treino'} - {t.data}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                disabled={!selectedTraining}
                onClick={() =>
                  router.post(route('desportivo.presencas.mark-all-present'), {
                    training_id: selectedTraining?.id,
                  })
                }
              >
                Todos Presentes
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!selectedTraining}
                onClick={() =>
                  router.post(route('desportivo.presencas.clear-all'), {
                    training_id: selectedTraining?.id,
                  })
                }
              >
                Limpar
              </Button>
            </div>
          </div>

          {!selectedTraining ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Selecione um treino para gerir presenças
            </p>
          ) : presenceForm.data.presences.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Nenhuma presença encontrada
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {presenceForm.data.presences.map((p, idx) => (
                  <div
                    key={p.id}
                    className="border rounded-lg p-3 space-y-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="font-medium text-sm">
                      {presences[idx]?.nome_atleta ?? 'Atleta'}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`status-${idx}`}>Status</Label>
                        <Select
                          value={p.status}
                          onValueChange={(value) => updatePresence(idx, { status: value })}
                        >
                          <SelectTrigger id={`status-${idx}`} className="bg-white">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`distancia-${idx}`}>Distância (m)</Label>
                        <Input
                          id={`distancia-${idx}`}
                          type="number"
                          placeholder="Metros"
                          value={p.distancia_realizada_m ?? ''}
                          onChange={(e) =>
                            updatePresence(idx, {
                              distancia_realizada_m: Number(e.target.value || 0),
                            })
                          }
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`classificacao-${idx}`}>Classificação</Label>
                        <Select
                          value={p.classificacao}
                          onValueChange={(value) =>
                            updatePresence(idx, { classificacao: value })
                          }
                        >
                          <SelectTrigger id={`classificacao-${idx}`} className="bg-white">
                            <SelectValue placeholder="Classificação" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Sem classificação</SelectItem>
                            {classificacaoOptions.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`notas-${idx}`}>Notas</Label>
                        <Input
                          id={`notas-${idx}`}
                          placeholder="Observações"
                          value={p.notas}
                          onChange={(e) => updatePresence(idx, { notas: e.target.value })}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => presenceForm.put(route('desportivo.presencas.update'))}
                disabled={presenceForm.processing}
                className="gap-2"
              >
                <FloppyDisk size={16} weight="bold" />
                Guardar Presenças
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
