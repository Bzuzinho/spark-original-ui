import { FormEvent, useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { useKV } from '@/hooks/useKV';
import { SectionTitle } from '@/Components/Desportivo2/components/SectionTitle';
import { SessionCard } from '@/Components/Desportivo2/components/SessionCard';
import type { AgeGroup, Competition, Training, TrainingTemplate } from './types';

interface Props {
  trainings: Training[];
  ageGroups: AgeGroup[];
  selectedSeasonId?: string;
  competitions: Competition[];
}

export function Desportivo2TreinosTab({ trainings, ageGroups, selectedSeasonId, competitions }: Props) {
  const [templates, setTemplates] = useKV<TrainingTemplate[]>('sports-v2-training-templates', []);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);

  const form = useForm({
    numero_treino: '',
    data: '',
    hora_inicio: '18:00',
    hora_fim: '19:30',
    local: '',
    epoca_id: selectedSeasonId ?? '',
    escaloes: [] as string[],
    tipo_treino: 'Técnico',
    volume_planeado_m: '',
    descricao_treino: '',
    notas_gerais: '',
  });

  const weeklyAgenda = useMemo(() => {
    return [...trainings]
      .sort((a, b) => `${a.data} ${a.hora_inicio ?? ''}`.localeCompare(`${b.data} ${b.hora_inicio ?? ''}`))
      .slice(0, 14);
  }, [trainings]);

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
    const endpoint = editingTrainingId
      ? route('desportivo.treino.update', editingTrainingId)
      : route('desportivo.treino.store');
    const action = editingTrainingId ? form.put : form.post;

    action(endpoint, {
      onSuccess: () => {
        setCreateOpen(false);
        form.reset();
        setEditingTrainingId(null);
      },
    });
  };

  const applyTemplate = (template: TrainingTemplate) => {
    form.setData('tipo_treino', template.tipo_treino);
    form.setData('volume_planeado_m', String(template.volume_planeado_m ?? ''));
    form.setData('descricao_treino', template.descricao_treino ?? '');
    form.setData('escaloes', template.escaloes ?? []);
  };

  const saveTemplate = () => {
    if (!form.data.descricao_treino.trim()) {
      return;
    }
    const next: TrainingTemplate = {
      id: crypto.randomUUID(),
      nome: form.data.numero_treino ? `Modelo ${form.data.numero_treino}` : `Modelo ${new Date().toISOString().slice(0, 10)}`,
      tipo_treino: form.data.tipo_treino,
      volume_planeado_m: form.data.volume_planeado_m ? Number(form.data.volume_planeado_m) : undefined,
      descricao_treino: form.data.descricao_treino,
      escaloes: form.data.escaloes,
      created_at: new Date().toISOString(),
    };
    setTemplates((prev) => [next, ...prev].slice(0, 50));
  };

  const openEdit = (training: Training) => {
    form.setData('numero_treino', training.numero_treino ?? '');
    form.setData('data', training.data ?? '');
    form.setData('hora_inicio', training.hora_inicio ?? '18:00');
    form.setData('hora_fim', training.hora_fim ?? '19:30');
    form.setData('local', training.local ?? '');
    form.setData('epoca_id', selectedSeasonId ?? '');
    form.setData('escaloes', training.escaloes ?? []);
    form.setData('tipo_treino', training.tipo_treino ?? 'Técnico');
    form.setData('volume_planeado_m', String(training.volume_planeado_m ?? ''));
    form.setData('descricao_treino', training.descricao_treino ?? '');
    form.setData('notas_gerais', '');
    setEditingTrainingId(training.id);
    setCreateOpen(true);
  };

  const duplicateMany = (ids: string[]) => {
    ids.forEach((id) => {
      router.post(route('desportivo.treino.duplicate', id), {}, { preserveScroll: true, preserveState: true });
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <SectionTitle
          title="Treinos"
          subtitle="Biblioteca, agendamento, duplicação inteligente e calendário compacto"
        />
        <Button size="sm" onClick={() => { setEditingTrainingId(null); setCreateOpen(true); }}>Agendar treino</Button>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Biblioteca de treinos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weeklyAgenda.length === 0 && <p className="text-xs text-muted-foreground">Sem treinos agendados.</p>}
            {weeklyAgenda.map((training) => (
              <SessionCard
                key={training.id}
                title={`${training.numero_treino || 'Treino'} · ${training.tipo_treino}`}
                subtitle={`${training.data} ${training.hora_inicio || '--:--'} ${training.local ? `· ${training.local}` : ''}`}
                onOpen={() => router.get(route('desportivo2.presencas'), { training_id: training.id, cais: 1 })}
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
            <p className="text-xs text-muted-foreground">
              Ao selecionar escalões, os atletas associados ao grupo são preparados automaticamente pelo backend.
            </p>
            <div className="flex flex-wrap gap-1">
              {ageGroups.slice(0, 10).map((g) => (
                <Badge key={g.id} variant="outline" className="text-[10px]">{g.nome}</Badge>
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={() => { setEditingTrainingId(null); setCreateOpen(true); }}>
              Abrir formulário de agendamento
            </Button>
            <p className="text-[11px] text-muted-foreground">
              Contexto de ciclo ativo: {selectedSeasonId || 'Sem época ativa selecionada'}
            </p>
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
            <div className="space-y-1">
              {templates.length === 0 && <p className="text-xs text-muted-foreground">Sem modelos guardados.</p>}
              {templates.slice(0, 6).map((template) => (
                <div key={template.id} className="border rounded-md p-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium">{template.nome}</p>
                    <p className="text-xs text-muted-foreground">{template.tipo_treino} · {template.volume_planeado_m || 0}m</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => applyTemplate(template)}>Aplicar</Button>
                </div>
              ))}
            </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTrainingId ? 'Editar treino - Desportivo 2' : 'Novo treino - Desportivo 2'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="v2-numero">Nº treino</Label>
                <Input id="v2-numero" value={form.data.numero_treino} onChange={(e) => form.setData('numero_treino', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v2-data">Data</Label>
                <Input id="v2-data" type="date" value={form.data.data} onChange={(e) => form.setData('data', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="v2-hi">Início</Label>
                <Input id="v2-hi" type="time" value={form.data.hora_inicio} onChange={(e) => form.setData('hora_inicio', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v2-hf">Fim</Label>
                <Input id="v2-hf" type="time" value={form.data.hora_fim} onChange={(e) => form.setData('hora_fim', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v2-local">Local</Label>
              <Input id="v2-local" value={form.data.local} onChange={(e) => form.setData('local', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v2-tipo">Tipo treino</Label>
              <Input id="v2-tipo" value={form.data.tipo_treino} onChange={(e) => form.setData('tipo_treino', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v2-volume">Volume (m)</Label>
              <Input id="v2-volume" type="number" value={form.data.volume_planeado_m} onChange={(e) => form.setData('volume_planeado_m', e.target.value)} />
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
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px]">Compatível com desportivo.treino.store</Badge>
              <Button type="button" variant="outline" size="sm" onClick={saveTemplate}>Guardar como modelo</Button>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={form.processing}>{editingTrainingId ? 'Atualizar treino' : 'Guardar treino'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
