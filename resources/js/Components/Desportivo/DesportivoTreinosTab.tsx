import { FormEvent, useEffect, useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { SectionTitle } from '@/components/sports/shared';
import { SessionCard } from '@/Components/Desportivo/components/SessionCard';
import type { AgeGroup, Competition, Training } from './types';

interface SeriesRow {
  id: string;
  repeticoes: string;
  exercicio: string;
  metros: string;
  zona: string;
}

function createSeriesRow(defaultZone = ''): SeriesRow {
  return {
    id: crypto.randomUUID(),
    repeticoes: '',
    exercicio: '',
    metros: '',
    zona: defaultZone,
  };
}

function formatZoneDescription(name: string): string {
  return name.replace(/^Zona\s*\d+\s*-\s*/i, '').trim();
}

interface Props {
  trainings: Training[];
  ageGroups: AgeGroup[];
  trainingTypeOptions: Array<{ id: string; nome: string }>;
  trainingZoneOptions: Array<{ id: string; codigo: string; nome: string }>;
  selectedSeasonId?: string;
  competitions: Competition[];
}

export function DesportivoTreinosTab({ trainings, ageGroups, trainingTypeOptions, trainingZoneOptions, selectedSeasonId, competitions }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [schedulingTraining, setSchedulingTraining] = useState<Training | null>(null);
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
  const [seriesRows, setSeriesRows] = useState<SeriesRow[]>([createSeriesRow(trainingZoneOptions[0]?.codigo ?? '')]);

  const form = useForm({
    numero_treino: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    local: '',
    epoca_id: selectedSeasonId ?? '',
    escaloes: [] as string[],
    tipo_treino: trainingTypeOptions[0]?.nome ?? '',
    volume_planeado_m: '',
    descricao_treino: '',
    notas_gerais: '',
  });

  const scheduleForm = useForm({
    data: new Date().toISOString().slice(0, 10),
    hora_inicio: '18:00',
    hora_fim: '19:30',
    local: '',
  });

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const nextTrainingNumber = useMemo(() => {
    const datePrefix = `T-${todayIso}-`;

    const existingCounters = trainings
      .map((training) => training.numero_treino ?? '')
      .filter((numero) => numero.startsWith(datePrefix))
      .map((numero) => Number(numero.slice(datePrefix.length)))
      .filter((value) => Number.isFinite(value));

    const nextCounter = existingCounters.length > 0 ? Math.max(...existingCounters) + 1 : 1;

    return `${datePrefix}${String(nextCounter).padStart(3, '0')}`;
  }, [trainings, todayIso]);

  const computedVolume = useMemo(() => {
    return seriesRows.reduce((total, row) => {
      const reps = Number(row.repeticoes) || 0;
      const meters = Number(row.metros) || 0;
      return total + (reps * meters);
    }, 0);
  }, [seriesRows]);

  useEffect(() => {
    if (form.data.tipo_treino || trainingTypeOptions.length === 0) {
      return;
    }

    form.setData('tipo_treino', trainingTypeOptions[0].nome);
  }, [trainingTypeOptions, form]);

  const libraryTrainings = useMemo(() => {
    return trainings.filter((training) => !training.data);
  }, [trainings]);

  const scheduledTrainings = useMemo(() => {
    return trainings.filter((training) => !!training.data);
  }, [trainings]);

  const weeklyAgenda = useMemo(() => {
    return [...scheduledTrainings]
      .sort((a, b) => `${a.data ?? ''} ${a.hora_inicio ?? ''}`.localeCompare(`${b.data ?? ''} ${b.hora_inicio ?? ''}`))
      .slice(0, 14);
  }, [scheduledTrainings]);

  const compactWeek = useMemo(() => {
    return weeklyAgenda.reduce<Record<string, Training[]>>((acc, t) => {
      const day = t.data;
      if (!acc[day]) acc[day] = [];
      acc[day].push(t);
      return acc;
    }, {});
  }, [weeklyAgenda]);

  const competitionsByDay = useMemo(() => {
    return (competitions ?? []).reduce<Record<string, Competition[]>>((acc, c) => {
      const day = (c.data_inicio || '').slice(0, 10);
      if (!day) return acc;
      if (!acc[day]) acc[day] = [];
      acc[day].push(c);
      return acc;
    }, {});
  }, [competitions]);

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const seriesPayload = seriesRows
      .map((row) => ({
        repeticoes: Number(row.repeticoes) || 0,
        exercicio: row.exercicio.trim(),
        metros: Number(row.metros) || 0,
        zona: row.zona,
      }))
      .filter((row) => row.repeticoes > 0 || row.metros > 0 || row.exercicio !== '' || row.zona !== '');

    const payload = {
      ...form.data,
      numero_treino: editingTrainingId ? form.data.numero_treino : nextTrainingNumber,
      data: editingTrainingId ? form.data.data : '',
      hora_inicio: editingTrainingId ? form.data.hora_inicio : '',
      hora_fim: editingTrainingId ? form.data.hora_fim : '',
      volume_planeado_m: computedVolume,
      series_linhas: seriesPayload,
    };

    const endpoint = editingTrainingId
      ? route('desportivo.treino.update', editingTrainingId)
      : route('desportivo.treino.store');
    const action = editingTrainingId ? form.put : form.post;

    form.transform(() => payload);

    action(endpoint, {
      onSuccess: () => {
        setCreateOpen(false);
        form.transform((data) => data);
        form.reset();
        form.setData('tipo_treino', trainingTypeOptions[0]?.nome ?? '');
        setEditingTrainingId(null);
        setSeriesRows([createSeriesRow(trainingZoneOptions[0]?.codigo ?? '')]);
      },
    });
  };

  const openEdit = (training: Training) => {
    form.setData('numero_treino', training.numero_treino ?? '');
    form.setData('data', training.data ?? '');
    form.setData('hora_inicio', training.hora_inicio ?? '');
    form.setData('hora_fim', training.hora_fim ?? '');
    form.setData('local', training.local ?? '');
    form.setData('epoca_id', selectedSeasonId ?? '');
    form.setData('escaloes', training.escaloes ?? []);
    form.setData('tipo_treino', training.tipo_treino ?? 'Técnico');
    form.setData('volume_planeado_m', String(training.volume_planeado_m ?? 0));
    form.setData('descricao_treino', training.descricao_treino ?? '');
    form.setData('notas_gerais', '');
    setEditingTrainingId(training.id);
    setSeriesRows([createSeriesRow(trainingZoneOptions[0]?.codigo ?? '')]);
    setCreateOpen(true);
  };

  const duplicateMany = (ids: string[]) => {
    ids.forEach((id) => {
      router.post(route('desportivo.treino.duplicate', id), {}, { preserveScroll: true, preserveState: true });
    });
  };

  const openSchedule = (training: Training) => {
    setSchedulingTraining(training);
    scheduleForm.setData('data', new Date().toISOString().slice(0, 10));
    scheduleForm.setData('hora_inicio', training.hora_inicio ?? '18:00');
    scheduleForm.setData('hora_fim', training.hora_fim ?? '19:30');
    scheduleForm.setData('local', training.local ?? '');
    setScheduleOpen(true);
  };

  const submitSchedule = (event: FormEvent) => {
    event.preventDefault();

    if (!schedulingTraining) {
      return;
    }

    const payload = {
      numero_treino: schedulingTraining.numero_treino ?? nextTrainingNumber,
      data: scheduleForm.data.data,
      hora_inicio: scheduleForm.data.hora_inicio,
      hora_fim: scheduleForm.data.hora_fim,
      local: scheduleForm.data.local,
      epoca_id: schedulingTraining.epoca_id ?? selectedSeasonId ?? '',
      microciclo_id: schedulingTraining.microciclo_id ?? '',
      tipo_treino: schedulingTraining.tipo_treino,
      volume_planeado_m: schedulingTraining.volume_planeado_m ?? computedVolume,
      descricao_treino: schedulingTraining.descricao_treino ?? '',
      notas_gerais: schedulingTraining.notas_gerais ?? '',
      escaloes: schedulingTraining.escaloes ?? [],
    };

    scheduleForm.transform(() => payload);

    scheduleForm.put(route('desportivo.treino.update', schedulingTraining.id), {
      onSuccess: () => {
        setScheduleOpen(false);
        setSchedulingTraining(null);
        scheduleForm.transform((data) => data);
      },
    });
  };

  const openDetails = (training: Training) => {
    setSelectedTraining(training);
    setDetailsOpen(true);
  };

  const selectedEscaloes = useMemo(() => {
    if (!selectedTraining?.escaloes || selectedTraining.escaloes.length === 0) {
      return [];
    }

    return selectedTraining.escaloes.map((escalaoId) => {
      const group = ageGroups.find((item) => item.id === escalaoId);
      return group?.nome ?? escalaoId;
    });
  }, [selectedTraining, ageGroups]);

  return (
    <div className="space-y-3">
      <SectionTitle
        title="Treinos"
        subtitle="Biblioteca, agendamento, duplicação inteligente e calendário compacto"
      />

      <div className="grid gap-3 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-2 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm">Biblioteca de treinos</CardTitle>
            <Button size="sm" className="w-full sm:w-auto" onClick={() => { setEditingTrainingId(null); setCreateOpen(true); }}>
              Criar treino
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {libraryTrainings.length === 0 && <p className="text-xs text-muted-foreground">Sem treinos em biblioteca.</p>}
            {libraryTrainings.map((training) => (
              <SessionCard
                key={training.id}
                title={`${training.numero_treino || 'Treino'} · ${training.tipo_treino}`}
                subtitle={training.descricao_treino || 'Treino guardado sem agendamento'}
                onOpen={() => openDetails(training)}
                onEdit={() => openEdit(training)}
                onDelete={() => router.delete(route('desportivo.treino.delete', training.id), { preserveScroll: true })}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Agendar treinos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {libraryTrainings.length === 0 && (
              <p className="text-xs text-muted-foreground">Sem treinos da biblioteca por agendar.</p>
            )}
            {libraryTrainings.slice(0, 8).map((training) => (
              <div key={training.id} className="border rounded-md p-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium break-words">{training.numero_treino || 'Treino'} · {training.tipo_treino}</p>
                  <p className="text-[11px] text-muted-foreground break-words">{training.descricao_treino || 'Sem descrição'}</p>
                </div>
                <Button size="sm" className="w-full sm:w-auto" onClick={() => openSchedule(training)}>
                  Agendar
                </Button>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">Contexto de ciclo ativo: {selectedSeasonId || 'Sem época ativa selecionada'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Duplicação inteligente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => weeklyAgenda[0] && router.post(route('desportivo.treino.duplicate', weeklyAgenda[0].id), {})}
                disabled={weeklyAgenda.length === 0}
              >
                Duplicar treino
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => duplicateMany(weeklyAgenda.slice(0, 7).map((t) => t.id))}
                disabled={weeklyAgenda.length === 0}
              >
                Duplicar semana
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => duplicateMany(weeklyAgenda.slice(0, 14).map((t) => t.id))}
                disabled={weeklyAgenda.length === 0}
              >
                Duplicar microciclo
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              TODO: quando existir endpoint específico, substituir duplicação em lote por operação transacional por semana/microciclo.
            </p>
            <p className="text-xs text-muted-foreground">Modelos de treino desativados temporariamente.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Calendário de agendamentos (semanal)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.keys(compactWeek).length === 0 && <p className="text-xs text-muted-foreground">Sem agendamentos.</p>}
            {Object.entries(compactWeek).map(([day, dayTrainings]) => (
              <div key={day} className="border rounded-md p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">{day}</p>
                  <Badge variant="secondary" className="text-[10px]">{dayTrainings.length} treinos</Badge>
                </div>
                <div className="space-y-1">
                  {dayTrainings.map((t) => (
                    <div key={t.id} className="text-[11px] text-muted-foreground">
                      {t.hora_inicio || '--:--'} · {t.tipo_treino} {t.local ? `· ${t.local}` : ''}
                    </div>
                  ))}
                  {(competitionsByDay[day] ?? []).map((c) => (
                    <div key={c.id} className="text-[11px] text-amber-700">
                      Prova: {c.titulo}{c.local ? ` · ${c.local}` : ''}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTrainingId ? 'Editar treino - Desportivo' : 'Novo treino - Desportivo'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do treino e a tabela de séries para guardar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="v2-numero">Nº treino</Label>
                <Input id="v2-numero" value={editingTrainingId ? form.data.numero_treino : nextTrainingNumber} readOnly />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v2-tipo">Tipo treino</Label>
                <Select value={form.data.tipo_treino} onValueChange={(value) => form.setData('tipo_treino', value)}>
                  <SelectTrigger id="v2-tipo">
                    <SelectValue placeholder="Selecionar tipo de treino" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainingTypeOptions.map((typeOption) => (
                      <SelectItem key={typeOption.id} value={typeOption.nome}>
                        {typeOption.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v2-volume">Volume (m)</Label>
              <Input id="v2-volume" type="number" value={computedVolume} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v2-desc">Descrição</Label>
              <Input id="v2-desc" value={form.data.descricao_treino} onChange={(e) => form.setData('descricao_treino', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Escalões</Label>
              <div className="flex gap-1 flex-wrap">
                {ageGroups.map((group) => {
                  const selected = form.data.escaloes.includes(group.id);
                  return (
                    <Button
                      key={group.id}
                      type="button"
                      size="sm"
                      variant={selected ? 'default' : 'outline'}
                      onClick={() => {
                        if (selected) {
                          form.setData('escaloes', form.data.escaloes.filter((id) => id !== group.id));
                        } else {
                          form.setData('escaloes', [...form.data.escaloes, group.id]);
                        }
                      }}
                    >
                      {group.nome}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Tabela de séries</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setSeriesRows((prev) => [...prev, createSeriesRow(trainingZoneOptions[0]?.codigo ?? '')])}
                >
                  Adicionar linha
                </Button>
              </div>
              <div className="border rounded-md p-2 space-y-2">
                  <div className="grid grid-cols-[92px_minmax(0,1fr)_92px_120px_110px_88px] gap-2 px-1 text-[11px] font-medium text-muted-foreground">
                    <div>Repetições</div>
                    <div>Exercício</div>
                    <div>Metros</div>
                    <div>Zona</div>
                    <div>Metros total</div>
                    <div>Ação</div>
                  </div>
                  {seriesRows.map((row) => {
                    const reps = Number(row.repeticoes) || 0;
                    const meters = Number(row.metros) || 0;
                    const total = reps * meters;

                    return (
                      <div
                        key={row.id}
                        className="grid grid-cols-[92px_minmax(0,1fr)_92px_120px_110px_88px] gap-2 items-center"
                      >
                        <Input
                          value={row.repeticoes}
                          maxLength={5}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
                            setSeriesRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, repeticoes: value } : item)));
                          }}
                        />
                        <Input
                          className="min-w-0"
                          value={row.exercicio}
                          placeholder="Ex: 200cr cb + 200c cb + 400 e"
                          onChange={(e) => {
                            const value = e.target.value;
                            setSeriesRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, exercicio: value } : item)));
                          }}
                        />
                        <Input
                          value={row.metros}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setSeriesRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, metros: value } : item)));
                          }}
                        />
                        <Select
                          value={row.zona}
                          onValueChange={(value) => {
                            setSeriesRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, zona: value } : item)));
                          }}
                        >
                          <SelectTrigger className="h-auto py-1.5">
                            {(() => {
                              const selectedZone = trainingZoneOptions.find((zoneOption) => zoneOption.codigo === row.zona);

                              if (!selectedZone) {
                                return <SelectValue placeholder="Zona" />;
                              }

                              return (
                                <div className="text-left leading-tight">
                                  <div className="text-[11px] font-medium">{selectedZone.codigo}</div>
                                  <div className="text-[9px] text-muted-foreground">{formatZoneDescription(selectedZone.nome)}</div>
                                </div>
                              );
                            })()}
                          </SelectTrigger>
                          <SelectContent>
                            {trainingZoneOptions.map((zoneOption) => (
                              <SelectItem key={zoneOption.id} value={zoneOption.codigo}>
                                <div className="leading-tight py-0.5">
                                  <div className="text-[11px] font-medium">{zoneOption.codigo}</div>
                                  <div className="text-[9px] text-muted-foreground">{formatZoneDescription(zoneOption.nome)}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="px-2 text-sm text-muted-foreground">{total} m</div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="justify-self-start"
                          onClick={() => setSeriesRows((prev) => (prev.length === 1 ? prev : prev.filter((item) => item.id !== row.id)))}
                        >
                          Remover
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={form.processing}>{editingTrainingId ? 'Atualizar treino' : 'Guardar treino'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Agendar treino</DialogTitle>
            <DialogDescription>
              Defina data, horas e local para agendar o treino selecionado.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitSchedule} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nº treino</Label>
              <Input value={schedulingTraining?.numero_treino ?? '-'} readOnly />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="schedule-data">Data</Label>
                <Input
                  id="schedule-data"
                  type="date"
                  value={scheduleForm.data.data}
                  onChange={(e) => scheduleForm.setData('data', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="schedule-local">Local</Label>
                <Input
                  id="schedule-local"
                  value={scheduleForm.data.local}
                  onChange={(e) => scheduleForm.setData('local', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="schedule-start">Hora início</Label>
                <Input
                  id="schedule-start"
                  type="time"
                  value={scheduleForm.data.hora_inicio}
                  onChange={(e) => scheduleForm.setData('hora_inicio', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="schedule-end">Hora fim</Label>
                <Input
                  id="schedule-end"
                  type="time"
                  value={scheduleForm.data.hora_fim}
                  onChange={(e) => scheduleForm.setData('hora_fim', e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setScheduleOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={scheduleForm.processing}>
                Guardar agendamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhe do treino</DialogTitle>
            <DialogDescription>
              Visualização dos dados principais e séries do treino selecionado.
            </DialogDescription>
          </DialogHeader>

          {selectedTraining ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border rounded-md p-3">
                  <p className="text-[11px] text-muted-foreground">Nº treino</p>
                  <p className="text-sm font-medium">{selectedTraining.numero_treino || '-'}</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-[11px] text-muted-foreground">Tipo de treino</p>
                  <p className="text-sm font-medium">{selectedTraining.tipo_treino || '-'}</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-[11px] text-muted-foreground">Volume total (m)</p>
                  <p className="text-sm font-medium">{selectedTraining.volume_planeado_m ?? 0} m</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-[11px] text-muted-foreground">Escalão atribuído</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedEscaloes.length > 0 ? (
                      selectedEscaloes.map((escalao) => (
                        <Badge key={escalao} variant="outline" className="text-[10px]">{escalao}</Badge>
                      ))
                    ) : (
                      <p className="text-sm">-</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-3 space-y-1.5">
                <p className="text-[11px] text-muted-foreground">Descrição</p>
                <p className="text-sm whitespace-pre-wrap">{selectedTraining.descricao_treino || '-'}</p>
              </div>

              <div className="border rounded-md p-3 space-y-2">
                <p className="text-[11px] text-muted-foreground">Tabela de séries</p>

                {(selectedTraining.series ?? []).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="py-2 pr-2">Ordem</th>
                          <th className="py-2 pr-2">Descrição</th>
                          <th className="py-2 pr-2">Repetições</th>
                          <th className="py-2 pr-2">Distância total (m)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedTraining.series ?? []).map((serie) => (
                          <tr key={serie.id} className="border-b last:border-b-0">
                            <td className="py-2 pr-2">{serie.ordem ?? '-'}</td>
                            <td className="py-2 pr-2">{serie.descricao_texto || '-'}</td>
                            <td className="py-2 pr-2">{serie.repeticoes ?? '-'}</td>
                            <td className="py-2 pr-2">{serie.distancia_total_m ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Sem séries registadas para este treino.</p>
                )}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDetailsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
