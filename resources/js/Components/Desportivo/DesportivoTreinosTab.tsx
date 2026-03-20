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
import type { AgeGroup, Season, Training, User } from './types';

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
  seasons: Season[];
  ageGroups: AgeGroup[];
  users: User[];
  trainingTypeOptions: Array<{ id: string; nome: string }>;
  trainingZoneOptions: Array<{ id: string; codigo: string; nome: string }>;
  selectedSeasonId?: string;
  macrocycles: Array<{ id: string; nome: string; epoca_id?: string }>;
  mesocycles: Array<{ id: string; nome: string; macrociclo_id?: string; epoca_id?: string }>;
  microcycles: Array<{ id: string; nome: string; macrocycle_id?: string; epoca_id?: string; mesociclo_id?: string }>;
}

export function DesportivoTreinosTab({ trainings, seasons, ageGroups, users, trainingTypeOptions, trainingZoneOptions, selectedSeasonId, macrocycles, mesocycles, microcycles }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editScheduleOpen, setEditScheduleOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
  const [editingScheduledTraining, setEditingScheduledTraining] = useState<Training | null>(null);
  const [attendanceTraining, setAttendanceTraining] = useState<Training | null>(null);
  const [attendanceRows, setAttendanceRows] = useState<Array<{ id: string; user_id: string; nome_atleta: string; estado: string }>>([]);
  const [newAttendanceUserId, setNewAttendanceUserId] = useState('');
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
    training_id: '',
    data: new Date().toISOString().slice(0, 10),
    hora_inicio: '18:00',
    hora_fim: '19:30',
    local: '',
    escaloes: [] as string[],
    epoca_id: selectedSeasonId ?? '',
    macrocycle_id: '',
    mesociclo_id: '',
    microciclo_id: '',
  });

  const editScheduleForm = useForm({
    numero_treino: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    local: '',
    escaloes: [] as string[],
    epoca_id: selectedSeasonId ?? '',
    macrocycle_id: '',
    mesociclo_id: '',
    microciclo_id: '',
    tipo_treino: '',
    descricao_treino: '',
    volume_planeado_m: '',
  });

  const nextTrainingNumber = useMemo(() => {
    const currentMax = trainings.reduce((maxValue, training) => {
      const match = (training.numero_treino ?? '').match(/^#(\d+)$/);
      if (!match) {
        return maxValue;
      }

      return Math.max(maxValue, Number(match[1]));
    }, 0);

    return `#${String(currentMax + 1).padStart(4, '0')}`;
  }, [trainings]);

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

  const schedulingTraining = useMemo(() => {
    return libraryTrainings.find((training) => training.id === scheduleForm.data.training_id) ?? null;
  }, [libraryTrainings, scheduleForm.data.training_id]);

  const filteredMacrocycles = useMemo(() => {
    if (!scheduleForm.data.epoca_id) {
      return macrocycles;
    }

    return macrocycles.filter((macrocycle) => !macrocycle.epoca_id || macrocycle.epoca_id === scheduleForm.data.epoca_id);
  }, [macrocycles, scheduleForm.data.epoca_id]);

  const filteredEditMacrocycles = useMemo(() => {
    if (!editScheduleForm.data.epoca_id) {
      return macrocycles;
    }

    return macrocycles.filter((macrocycle) => !macrocycle.epoca_id || macrocycle.epoca_id === editScheduleForm.data.epoca_id);
  }, [macrocycles, editScheduleForm.data.epoca_id]);

  const filteredMicrocycles = useMemo(() => {
    const seasonScoped = scheduleForm.data.epoca_id
      ? microcycles.filter((microcycle) => !microcycle.epoca_id || microcycle.epoca_id === scheduleForm.data.epoca_id)
      : microcycles;

    if (!scheduleForm.data.macrocycle_id) {
      return seasonScoped;
    }

    return seasonScoped.filter((microcycle) => microcycle.macrocycle_id === scheduleForm.data.macrocycle_id);
  }, [microcycles, scheduleForm.data.epoca_id, scheduleForm.data.macrocycle_id]);

  const filteredMesocycles = useMemo(() => {
    const seasonScoped = scheduleForm.data.epoca_id
      ? mesocycles.filter((mesocycle) => !mesocycle.epoca_id || mesocycle.epoca_id === scheduleForm.data.epoca_id)
      : mesocycles;

    if (!scheduleForm.data.macrocycle_id) {
      return seasonScoped;
    }

    return seasonScoped.filter((mesocycle) => mesocycle.macrociclo_id === scheduleForm.data.macrocycle_id);
  }, [mesocycles, scheduleForm.data.epoca_id, scheduleForm.data.macrocycle_id]);

  const filteredEditMicrocycles = useMemo(() => {
    const seasonScoped = editScheduleForm.data.epoca_id
      ? microcycles.filter((microcycle) => !microcycle.epoca_id || microcycle.epoca_id === editScheduleForm.data.epoca_id)
      : microcycles;

    if (!editScheduleForm.data.macrocycle_id) {
      return seasonScoped;
    }

    return seasonScoped.filter((microcycle) => microcycle.macrocycle_id === editScheduleForm.data.macrocycle_id);
  }, [microcycles, editScheduleForm.data.epoca_id, editScheduleForm.data.macrocycle_id]);

  const filteredEditMesocycles = useMemo(() => {
    const seasonScoped = editScheduleForm.data.epoca_id
      ? mesocycles.filter((mesocycle) => !mesocycle.epoca_id || mesocycle.epoca_id === editScheduleForm.data.epoca_id)
      : mesocycles;

    if (!editScheduleForm.data.macrocycle_id) {
      return seasonScoped;
    }

    return seasonScoped.filter((mesocycle) => mesocycle.macrociclo_id === editScheduleForm.data.macrocycle_id);
  }, [mesocycles, editScheduleForm.data.epoca_id, editScheduleForm.data.macrocycle_id]);

  const microcycleByMesocycle = useMemo(() => {
    const map = new Map<string, string>();
    microcycles.forEach((microcycle) => {
      if (!microcycle.mesociclo_id) return;
      if (!map.has(microcycle.mesociclo_id)) {
        map.set(microcycle.mesociclo_id, microcycle.id);
      }
    });
    return map;
  }, [microcycles]);

  const mesocycleByMicrocycle = useMemo(() => {
    const map = new Map<string, string>();
    microcycles.forEach((microcycle) => {
      if (!microcycle.mesociclo_id) return;
      map.set(microcycle.id, microcycle.mesociclo_id);
    });
    return map;
  }, [microcycles]);

  const availableAttendanceUsers = useMemo(() => {
    const selectedIds = new Set(attendanceRows.map((row) => row.user_id));

    return users
      .filter((user) => !selectedIds.has(user.id))
      .filter((user) => !Array.isArray(user.tipo_membro) || user.tipo_membro.length === 0 || user.tipo_membro.includes('atleta'))
      .sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));
  }, [attendanceRows, users]);

  const formatCreationDateTime = (value?: string | null) => {
    if (!value) {
      return 'Sem data de criação';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Sem data de criação';
    }

    return date.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatScheduleDate = (value?: string | null) => {
    if (!value) {
      return 'Sem data';
    }

    return value.slice(0, 10);
  };

  const normalizeDateInputValue = (value?: string | null) => {
    if (!value) {
      return '';
    }

    return value.slice(0, 10);
  };

  const formatTimeRange = (start?: string | null, end?: string | null) => {
    if (!start) {
      return '--:--';
    }

    return end ? `${start} – ${end}` : start;
  };

  const resolveEscaloes = (escalaoIds?: string[] | null) => {
    return (escalaoIds ?? [])
      .map((id) => ageGroups.find((group) => group.id === id)?.nome ?? id)
      .join(', ');
  };

  const isScheduledTraining = (training?: Training | null) => !!training?.data;

  useEffect(() => {
    if (selectedSeasonId && !scheduleForm.data.epoca_id) {
      scheduleForm.setData('epoca_id', selectedSeasonId);
    }
  }, [selectedSeasonId, scheduleForm]);

  useEffect(() => {
    if (!scheduleForm.data.macrocycle_id) {
      return;
    }

    if (!scheduleForm.data.mesociclo_id) {
      return;
    }

    const isSelectedMesocycleCompatible = filteredMesocycles.some((item) => item.id === scheduleForm.data.mesociclo_id);
    if (!isSelectedMesocycleCompatible) {
      scheduleForm.setData('mesociclo_id', '');
      scheduleForm.setData('microciclo_id', '');
      return;
    }

    const derivedMicrocycleId = microcycleByMesocycle.get(scheduleForm.data.mesociclo_id) ?? '';
    if (scheduleForm.data.microciclo_id !== derivedMicrocycleId) {
      scheduleForm.setData('microciclo_id', derivedMicrocycleId);
    }
  }, [filteredMesocycles, scheduleForm.data.macrocycle_id, scheduleForm.data.mesociclo_id, scheduleForm.data.microciclo_id, microcycleByMesocycle]);

  useEffect(() => {
    if (!scheduleForm.data.macrocycle_id) {
      return;
    }

    const compatibleMacro = filteredMacrocycles.some((item) => item.id === scheduleForm.data.macrocycle_id);
    if (!compatibleMacro) {
      scheduleForm.setData('macrocycle_id', '');
      scheduleForm.setData('mesociclo_id', '');
      scheduleForm.setData('microciclo_id', '');
    }
  }, [filteredMacrocycles, scheduleForm.data.macrocycle_id]);

  useEffect(() => {
    if (!editScheduleForm.data.macrocycle_id) {
      return;
    }

    if (!editScheduleForm.data.mesociclo_id) {
      return;
    }

    const isSelectedMesocycleCompatible = filteredEditMesocycles.some((item) => item.id === editScheduleForm.data.mesociclo_id);
    if (!isSelectedMesocycleCompatible) {
      editScheduleForm.setData('mesociclo_id', '');
      editScheduleForm.setData('microciclo_id', '');
      return;
    }

    const derivedMicrocycleId = microcycleByMesocycle.get(editScheduleForm.data.mesociclo_id) ?? '';
    if (editScheduleForm.data.microciclo_id !== derivedMicrocycleId) {
      editScheduleForm.setData('microciclo_id', derivedMicrocycleId);
    }
  }, [filteredEditMesocycles, editScheduleForm.data.macrocycle_id, editScheduleForm.data.mesociclo_id, editScheduleForm.data.microciclo_id, microcycleByMesocycle]);

  useEffect(() => {
    if (!editScheduleForm.data.macrocycle_id) {
      return;
    }

    const compatibleMacro = filteredEditMacrocycles.some((item) => item.id === editScheduleForm.data.macrocycle_id);
    if (!compatibleMacro) {
      editScheduleForm.setData('macrocycle_id', '');
      editScheduleForm.setData('mesociclo_id', '');
      editScheduleForm.setData('microciclo_id', '');
    }
  }, [filteredEditMacrocycles, editScheduleForm.data.macrocycle_id]);

  useEffect(() => {
    if (!attendanceOpen || !attendanceTraining) {
      return;
    }

    const updatedTraining = trainings.find((item) => item.id === attendanceTraining.id);
    if (!updatedTraining) {
      return;
    }

    setAttendanceTraining(updatedTraining);
    setAttendanceRows((updatedTraining.presencas_grupo ?? []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      nome_atleta: row.nome_atleta,
      estado: row.estado,
    })));
  }, [attendanceOpen, attendanceTraining, trainings]);

  const scheduledList = useMemo(() => {
    return [...scheduledTrainings]
      .sort((a, b) => `${a.data ?? ''} ${a.hora_inicio ?? ''}`.localeCompare(`${b.data ?? ''} ${b.hora_inicio ?? ''}`));
  }, [scheduledTrainings]);

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
    form.setData('data', normalizeDateInputValue(training.data));
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

  const submitSchedule = (event: FormEvent) => {
    event.preventDefault();

    if (!scheduleForm.data.training_id) {
      return;
    }

    const payload = {
      data: scheduleForm.data.data,
      hora_inicio: scheduleForm.data.hora_inicio,
      hora_fim: scheduleForm.data.hora_fim,
      local: scheduleForm.data.local,
      escaloes: scheduleForm.data.escaloes,
      epoca_id: scheduleForm.data.epoca_id || selectedSeasonId || null,
      macrocycle_id: scheduleForm.data.macrocycle_id || null,
      microciclo_id: scheduleForm.data.microciclo_id || null,
    };

    scheduleForm.transform(() => payload);

    scheduleForm.post(route('desportivo.treino.schedule', scheduleForm.data.training_id), {
      onSuccess: () => {
        setScheduleOpen(false);
        scheduleForm.transform((data) => data);
        scheduleForm.reset();
        scheduleForm.setData('data', new Date().toISOString().slice(0, 10));
        scheduleForm.setData('hora_inicio', '18:00');
        scheduleForm.setData('hora_fim', '19:30');
        scheduleForm.setData('local', '');
        scheduleForm.setData('training_id', '');
        scheduleForm.setData('escaloes', []);
        scheduleForm.setData('epoca_id', selectedSeasonId ?? '');
        scheduleForm.setData('macrocycle_id', '');
        scheduleForm.setData('mesociclo_id', '');
        scheduleForm.setData('microciclo_id', '');
      },
    });
  };

  const openDetails = (training: Training) => {
    setSelectedTraining(training);
    setDetailsOpen(true);
  };

  const openAttendance = (training: Training) => {
    setAttendanceTraining(training);
    setAttendanceRows((training.presencas_grupo ?? []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      nome_atleta: row.nome_atleta,
      estado: row.estado,
    })));
    setNewAttendanceUserId('');
    setAttendanceOpen(true);
  };

  const updateAttendanceRow = (rowId: string, estado: string) => {
    setAttendanceRows((currentRows) => currentRows.map((row) => (row.id === rowId ? { ...row, estado } : row)));
  };

  const saveAttendanceChanges = () => {
    if (!attendanceTraining) {
      return;
    }

    router.put(route('desportivo.treino.presencas.update', attendanceTraining.id), {
      presencas: attendanceRows.map((row) => ({ id: row.id, estado: row.estado })),
    }, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        router.reload({
          only: ['trainings'],
        });
      },
    });
  };

  const addAthleteToAttendance = () => {
    if (!attendanceTraining || !newAttendanceUserId) {
      return;
    }

    router.post(route('desportivo.treino.atleta.add', attendanceTraining.id), {
      user_id: newAttendanceUserId,
    }, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setNewAttendanceUserId('');
        router.reload({
          only: ['trainings'],
        });
      },
    });
  };

  const removeAthleteFromAttendance = (userId: string) => {
    if (!attendanceTraining) {
      return;
    }

    router.delete(route('desportivo.treino.atleta.remove', [attendanceTraining.id, userId]), {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        router.reload({
          only: ['trainings'],
        });
      },
    });
  };

  const openEditSchedule = (training: Training) => {
    setEditingScheduledTraining(training);
    editScheduleForm.setData('numero_treino', training.numero_treino ?? '');
    editScheduleForm.setData('data', normalizeDateInputValue(training.data));
    editScheduleForm.setData('hora_inicio', training.hora_inicio ?? '');
    editScheduleForm.setData('hora_fim', training.hora_fim ?? '');
    editScheduleForm.setData('local', training.local ?? '');
    editScheduleForm.setData('escaloes', training.escaloes ?? []);
    editScheduleForm.setData('epoca_id', training.epoca_id ?? selectedSeasonId ?? '');
    editScheduleForm.setData('macrocycle_id', training.macrocycle_id ?? '');
    editScheduleForm.setData('mesociclo_id', training.microciclo_id ? (mesocycleByMicrocycle.get(training.microciclo_id) ?? '') : '');
    editScheduleForm.setData('microciclo_id', training.microciclo_id ?? '');
    editScheduleForm.setData('tipo_treino', training.tipo_treino ?? '');
    editScheduleForm.setData('descricao_treino', training.descricao_treino ?? '');
    editScheduleForm.setData('volume_planeado_m', String(training.volume_planeado_m ?? 0));
    setEditScheduleOpen(true);
  };

  const submitEditSchedule = (event: FormEvent) => {
    event.preventDefault();
    if (!editingScheduledTraining) return;

    editScheduleForm.put(route('desportivo.treino.update', editingScheduledTraining.id), {
      onSuccess: () => {
        setEditScheduleOpen(false);
        setEditingScheduledTraining(null);
        editScheduleForm.reset();
      },
    });
  };

  const deleteScheduled = (training: Training) => {
    if (!confirm(`Tem a certeza que quer apagar o agendamento "${training.numero_treino || 'Treino'}"?`)) return;
    router.delete(route('desportivo.treino.delete', training.id), { preserveScroll: true });
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

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm">Biblioteca de treinos</CardTitle>
            <Button size="sm" className="w-full sm:w-auto" onClick={() => {
              setEditingTrainingId(null);
              form.reset();
              form.setData('tipo_treino', trainingTypeOptions[0]?.nome ?? '');
              form.setData('epoca_id', selectedSeasonId ?? '');
              setSeriesRows([createSeriesRow(trainingZoneOptions[0]?.codigo ?? '')]);
              setCreateOpen(true);
            }}>
              Criar treino
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {libraryTrainings.length === 0 && <p className="text-xs text-muted-foreground">Sem treinos em biblioteca.</p>}
            {libraryTrainings.map((training) => {
              const escalaoLabel = resolveEscaloes(training.escaloes);

              return (
                <div key={training.id} className="border rounded-md p-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold break-words">{training.numero_treino || 'Treino'} · {training.tipo_treino}</p>
                    {escalaoLabel ? (
                      <p className="text-[11px] text-muted-foreground break-words">{escalaoLabel}</p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground break-words">Sem escalão definido</p>
                    )}
                    <p className="text-[11px] text-muted-foreground break-words">Criado em {formatCreationDateTime(training.created_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:shrink-0">
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openDetails(training)}>Abrir</Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openEdit(training)}>Editar</Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => router.delete(route('desportivo.treino.delete', training.id), { preserveScroll: true })}>Apagar</Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm">Calendário de agendamentos</CardTitle>
            <Button size="sm" className="w-full sm:w-auto" onClick={() => {
              scheduleForm.reset();
              scheduleForm.setData('data', new Date().toISOString().slice(0, 10));
              scheduleForm.setData('hora_inicio', '18:00');
              scheduleForm.setData('hora_fim', '19:30');
              scheduleForm.setData('epoca_id', selectedSeasonId ?? '');
              setScheduleOpen(true);
            }}>
              Agendar treino
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {scheduledList.length === 0 && <p className="text-xs text-muted-foreground">Sem agendamentos.</p>}
            {scheduledList.map((training) => {
              const dataFormatada = formatScheduleDate(training.data);
              const horaFormatada = formatTimeRange(training.hora_inicio, training.hora_fim);
              const escalaoNomes = resolveEscaloes(training.escaloes);

              return (
                <div key={training.id} className="border rounded-md p-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className="text-[10px] font-normal shrink-0">{dataFormatada}</Badge>
                      <span className="text-[10px] text-muted-foreground shrink-0">{horaFormatada}</span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
                      <p className="text-xs font-semibold break-words">{training.numero_treino || 'Treino'}</p>
                      <span className="text-[11px] text-muted-foreground break-words">{training.tipo_treino}</span>
                      <span className="text-[11px] text-muted-foreground break-words">{escalaoNomes || 'Sem escalão definido'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:shrink-0">
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openAttendance(training)}>Presenças</Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openDetails(training)}>Ver</Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openEditSchedule(training)}>Editar</Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => deleteScheduled(training)}>Apagar</Button>
                  </div>
                </div>
              );
            })}
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
              <div className="border rounded-md p-2 overflow-x-auto">
                <div className="min-w-[720px] space-y-2">
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
              Escolha o treino da biblioteca e defina data, horas, escalões e ciclo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitSchedule} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="schedule-training">Treino da biblioteca</Label>
              <Select
                value={scheduleForm.data.training_id || '__none__'}
                onValueChange={(value) => {
                  const selectedId = value === '__none__' ? '' : value;
                  const selectedItem = libraryTrainings.find((item) => item.id === selectedId);

                  scheduleForm.setData('training_id', selectedId);
                  scheduleForm.setData('hora_inicio', selectedItem?.hora_inicio ?? '18:00');
                  scheduleForm.setData('hora_fim', selectedItem?.hora_fim ?? '19:30');
                  scheduleForm.setData('local', selectedItem?.local ?? '');
                  scheduleForm.setData('escaloes', selectedItem?.escaloes ?? []);
                  scheduleForm.setData('epoca_id', selectedSeasonId ?? selectedItem?.epoca_id ?? '');
                  const selectedMacrocycleId = selectedItem?.macrocycle_id ?? '';
                  const selectedMicrocycleId = selectedItem?.microciclo_id ?? '';
                  const selectedMesocycleId = selectedMicrocycleId ? (mesocycleByMicrocycle.get(selectedMicrocycleId) ?? '') : '';

                  scheduleForm.setData('macrocycle_id', selectedMacrocycleId);
                  scheduleForm.setData('mesociclo_id', selectedMesocycleId);
                  scheduleForm.setData('microciclo_id', selectedMicrocycleId);
                }}
              >
                <SelectTrigger id="schedule-training">
                  <SelectValue placeholder="Selecionar treino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Selecionar treino</SelectItem>
                  {libraryTrainings.map((training) => (
                    <SelectItem key={training.id} value={training.id}>
                      {training.numero_treino || 'Treino'} · {training.tipo_treino}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Nº treino selecionado</Label>
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

            <div className="space-y-2">
              <Label>Escalões do treino agendado</Label>
              <div className="flex gap-1 flex-wrap">
                {ageGroups.map((group) => {
                  const selected = scheduleForm.data.escaloes.includes(group.id);

                  return (
                    <Button
                      key={group.id}
                      type="button"
                      size="sm"
                      variant={selected ? 'default' : 'outline'}
                      onClick={() => {
                        if (selected) {
                          scheduleForm.setData('escaloes', scheduleForm.data.escaloes.filter((id) => id !== group.id));
                        } else {
                          scheduleForm.setData('escaloes', [...scheduleForm.data.escaloes, group.id]);
                        }
                      }}
                    >
                      {group.nome}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="schedule-season">Época</Label>
                <Select
                  value={scheduleForm.data.epoca_id || '__none__'}
                  onValueChange={(value) => {
                    const seasonId = value === '__none__' ? '' : value;
                    scheduleForm.setData('epoca_id', seasonId);
                    scheduleForm.setData('macrocycle_id', '');
                    scheduleForm.setData('mesociclo_id', '');
                    scheduleForm.setData('microciclo_id', '');
                  }}
                >
                  <SelectTrigger id="schedule-season">
                    <SelectValue placeholder="Selecionar época" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem época</SelectItem>
                    {seasons.map((season) => (
                      <SelectItem key={season.id} value={season.id}>
                        {season.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="schedule-macro">Macrociclo (opcional)</Label>
                <Select
                  value={scheduleForm.data.macrocycle_id || '__none__'}
                  onValueChange={(value) => {
                    const macrocycleId = value === '__none__' ? '' : value;
                    scheduleForm.setData('macrocycle_id', macrocycleId);

                    if (!macrocycleId) {
                      scheduleForm.setData('mesociclo_id', '');
                      scheduleForm.setData('microciclo_id', '');
                    }
                  }}
                >
                  <SelectTrigger id="schedule-macro">
                    <SelectValue placeholder="Sem macrociclo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem macrociclo</SelectItem>
                    {filteredMacrocycles.map((macrocycle) => (
                      <SelectItem key={macrocycle.id} value={macrocycle.id}>
                        {macrocycle.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="schedule-meso">Mesociclo (opcional)</Label>
                <Select
                  value={scheduleForm.data.mesociclo_id || '__none__'}
                  onValueChange={(value) => {
                    const mesocicloId = value === '__none__' ? '' : value;
                    scheduleForm.setData('mesociclo_id', mesocicloId);
                    scheduleForm.setData('microciclo_id', mesocicloId ? (microcycleByMesocycle.get(mesocicloId) ?? '') : '');
                  }}
                >
                  <SelectTrigger id="schedule-meso">
                    <SelectValue placeholder="Sem mesociclo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem mesociclo</SelectItem>
                    {filteredMesocycles.map((mesocycle) => (
                      <SelectItem key={mesocycle.id} value={mesocycle.id}>
                        {mesocycle.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setScheduleOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={scheduleForm.processing || !scheduleForm.data.training_id || scheduleForm.data.escaloes.length === 0}>
                Guardar agendamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editScheduleOpen} onOpenChange={setEditScheduleOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar agendamento</DialogTitle>
            <DialogDescription>
              Altere a data, horário, local, escalões e ciclos do agendamento. O grupo de presenças será atualizado automaticamente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitEditSchedule} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-sched-data">Data</Label>
                <Input
                  id="edit-sched-data"
                  type="date"
                  value={editScheduleForm.data.data}
                  onChange={(e) => editScheduleForm.setData('data', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-sched-local">Local</Label>
                <Input
                  id="edit-sched-local"
                  value={editScheduleForm.data.local}
                  onChange={(e) => editScheduleForm.setData('local', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-sched-start">Hora início</Label>
                <Input
                  id="edit-sched-start"
                  type="time"
                  value={editScheduleForm.data.hora_inicio}
                  onChange={(e) => editScheduleForm.setData('hora_inicio', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-sched-end">Hora fim</Label>
                <Input
                  id="edit-sched-end"
                  type="time"
                  value={editScheduleForm.data.hora_fim}
                  onChange={(e) => editScheduleForm.setData('hora_fim', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Escalões</Label>
              <div className="flex gap-1 flex-wrap">
                {ageGroups.map((group) => {
                  const selected = editScheduleForm.data.escaloes.includes(group.id);
                  return (
                    <Button
                      key={group.id}
                      type="button"
                      size="sm"
                      variant={selected ? 'default' : 'outline'}
                      onClick={() => {
                        if (selected) {
                          editScheduleForm.setData('escaloes', editScheduleForm.data.escaloes.filter((id) => id !== group.id));
                        } else {
                          editScheduleForm.setData('escaloes', [...editScheduleForm.data.escaloes, group.id]);
                        }
                      }}
                    >
                      {group.nome}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-sched-season">Época</Label>
                <Select
                  value={editScheduleForm.data.epoca_id || '__none__'}
                  onValueChange={(value) => {
                    const seasonId = value === '__none__' ? '' : value;
                    editScheduleForm.setData('epoca_id', seasonId);
                    editScheduleForm.setData('macrocycle_id', '');
                    editScheduleForm.setData('mesociclo_id', '');
                    editScheduleForm.setData('microciclo_id', '');
                  }}
                >
                  <SelectTrigger id="edit-sched-season">
                    <SelectValue placeholder="Selecionar época" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem época</SelectItem>
                    {seasons.map((season) => (
                      <SelectItem key={season.id} value={season.id}>
                        {season.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-sched-macro">Macrociclo (opcional)</Label>
                <Select
                  value={editScheduleForm.data.macrocycle_id || '__none__'}
                  onValueChange={(value) => {
                    const macrocycleId = value === '__none__' ? '' : value;
                    editScheduleForm.setData('macrocycle_id', macrocycleId);
                    if (!macrocycleId) {
                      editScheduleForm.setData('mesociclo_id', '');
                      editScheduleForm.setData('microciclo_id', '');
                    }
                  }}
                >
                  <SelectTrigger id="edit-sched-macro">
                    <SelectValue placeholder="Sem macrociclo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem macrociclo</SelectItem>
                    {filteredEditMacrocycles.map((macrocycle) => (
                      <SelectItem key={macrocycle.id} value={macrocycle.id}>
                        {macrocycle.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-sched-meso">Mesociclo (opcional)</Label>
                <Select
                  value={editScheduleForm.data.mesociclo_id || '__none__'}
                  onValueChange={(value) => {
                    const mesocicloId = value === '__none__' ? '' : value;
                    editScheduleForm.setData('mesociclo_id', mesocicloId);
                    editScheduleForm.setData('microciclo_id', mesocicloId ? (microcycleByMesocycle.get(mesocicloId) ?? '') : '');
                  }}
                >
                  <SelectTrigger id="edit-sched-meso">
                    <SelectValue placeholder="Sem mesociclo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem mesociclo</SelectItem>
                    {filteredEditMesocycles.map((mesocycle) => (
                      <SelectItem key={mesocycle.id} value={mesocycle.id}>
                        {mesocycle.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditScheduleOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={editScheduleForm.processing || editScheduleForm.data.escaloes.length === 0}>
                Guardar alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={attendanceOpen} onOpenChange={setAttendanceOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Presenças do treino</DialogTitle>
            <DialogDescription>
              Gerir o grupo de presenças do treino agendado: estados, adicionar atletas e remover atletas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md border p-3 space-y-1">
              <p className="text-sm font-medium">{attendanceTraining?.numero_treino || 'Treino'} · {attendanceTraining?.tipo_treino || '-'}</p>
              <p className="text-xs text-muted-foreground">{formatScheduleDate(attendanceTraining?.data)} · {formatTimeRange(attendanceTraining?.hora_inicio, attendanceTraining?.hora_fim)}</p>
              <p className="text-xs text-muted-foreground">{resolveEscaloes(attendanceTraining?.escaloes) || 'Sem escalão definido'}</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="space-y-1.5 flex-1">
                <Label htmlFor="attendance-user">Adicionar atleta</Label>
                <Select value={newAttendanceUserId || '__none__'} onValueChange={(value) => setNewAttendanceUserId(value === '__none__' ? '' : value)}>
                  <SelectTrigger id="attendance-user">
                    <SelectValue placeholder="Selecionar atleta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Selecionar atleta</SelectItem>
                    {availableAttendanceUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>{user.nome_completo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" onClick={addAthleteToAttendance} disabled={!newAttendanceUserId}>
                Adicionar atleta
              </Button>
            </div>

            <div className="space-y-2">
              {attendanceRows.length === 0 && <p className="text-xs text-muted-foreground">Sem atletas no grupo de presenças.</p>}
              {attendanceRows.map((row) => (
                <div key={row.user_id} className="border rounded-md p-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium break-words">{row.nome_atleta}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Select value={row.estado} onValueChange={(value) => updateAttendanceRow(row.id, value)}>
                      <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presente">Presente</SelectItem>
                        <SelectItem value="ausente">Ausente</SelectItem>
                        <SelectItem value="dispensado">Dispensado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="ghost" className="text-xs" onClick={() => removeAthleteFromAttendance(row.user_id)}>
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAttendanceOpen(false)}>
              Fechar
            </Button>
            <Button type="button" onClick={saveAttendanceChanges} disabled={!attendanceTraining || attendanceRows.length === 0}>
              Guardar presenças
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhe do treino</DialogTitle>
            <DialogDescription>
              {isScheduledTraining(selectedTraining)
                ? 'Treino agendado: dados de sessão, presença e conteúdo técnico.'
                : 'Treino de biblioteca: template técnico ainda sem agendamento.'}
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
                  <p className="text-[11px] text-muted-foreground">Registo</p>
                  <p className="text-sm font-medium">{isScheduledTraining(selectedTraining) ? 'Agendado' : 'Biblioteca'}</p>
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
                  <p className="text-[11px] text-muted-foreground">Criado em</p>
                  <p className="text-sm font-medium">{formatCreationDateTime(selectedTraining.created_at)}</p>
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
                <div className="border rounded-md p-3">
                  <p className="text-[11px] text-muted-foreground">Data agendamento</p>
                  <p className="text-sm font-medium">{selectedTraining.data || '-'}</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-[11px] text-muted-foreground">Hora agendamento</p>
                  <p className="text-sm font-medium">{formatTimeRange(selectedTraining.hora_inicio, selectedTraining.hora_fim)}</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-[11px] text-muted-foreground">Local agendamento</p>
                  <p className="text-sm font-medium">{selectedTraining.local || '-'}</p>
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
