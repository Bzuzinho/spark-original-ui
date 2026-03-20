import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { AnnualCycleCalendar } from '@/Components/Desportivo/components/AnnualCycleCalendar';
import { SectionTitle } from '@/components/sports/shared';
import type { Macrocycle, MesocyclePlan, Season } from './types';

interface Props {
  seasons: Season[];
  macrocycles: Macrocycle[];
  mesocycles?: MesocyclePlan[];
  selectedSeasonId?: string | null;
}

const today = new Date().toISOString().slice(0, 10);

const formatDateRange = (start?: string | null, end?: string | null) => {
  const s = (start ?? '').slice(0, 10);
  const e = (end ?? '').slice(0, 10);
  if (!s && !e) return 'Sem datas';
  return `${s || '---- -- --'} até ${e || '---- -- --'}`;
};

const normalizeDateInput = (value?: string | null) => (value ?? '').slice(0, 10);

const macroState = (start?: string | null, end?: string | null) => {
  const s = (start ?? '').slice(0, 10);
  const e = (end ?? '').slice(0, 10);
  if (!s || !e) return 'agendado';
  if (today < s) return 'agendado';
  if (today > e) return 'concluido';
  return 'a decorrer';
};

const macroStateBadge = (state: string): 'default' | 'secondary' | 'outline' => {
  if (state === 'a decorrer') return 'default';
  if (state === 'concluido') return 'secondary';
  return 'outline';
};

export function DesportivoPlaneamentoTab({ seasons, macrocycles, mesocycles = [], selectedSeasonId = null }: Props) {
  const [seasonId, setSeasonId] = useState(selectedSeasonId ?? '');
  const [hasSelectedSeason, setHasSelectedSeason] = useState(Boolean(selectedSeasonId));
  const [showSeasonForm, setShowSeasonForm] = useState(false);
  const [editingSeasonId, setEditingSeasonId] = useState<string | null>(null);
  const [expandedMacroIds, setExpandedMacroIds] = useState<string[]>([]);
  const [macroDialogOpen, setMacroDialogOpen] = useState(false);
  const [mesoDialogOpen, setMesoDialogOpen] = useState(false);

  const [seasonDraft, setSeasonDraft] = useState({
    nome: '',
    ano_temporada: '',
    data_inicio: '',
    data_fim: '',
    tipo: 'Principal',
    estado: 'Planeada',
  });

  const [macroDraft, setMacroDraft] = useState({
    id: '',
    nome: '',
    data_inicio: '',
    data_fim: '',
    objetivo_principal: '',
    objetivo_secundario: '',
    tipo: 'Preparação geral',
  });

  const [mesoDraft, setMesoDraft] = useState({
    id: '',
    macrociclo_id: '',
    nome: '',
    data_inicio: '',
    data_fim: '',
    objetivo_principal: '',
    objetivo_secundario: '',
  });

  const seasonMacros = useMemo(
    () => (macrocycles ?? []).filter((macro) => macro.epoca_id === seasonId),
    [macrocycles, seasonId]
  );

  const mesocyclesByMacro = useMemo(() => {
    const map = new Map<string, MesocyclePlan[]>();
    (mesocycles ?? []).forEach((meso) => {
      const list = map.get(meso.macrociclo_id) ?? [];
      list.push(meso);
      map.set(meso.macrociclo_id, list);
    });
    return map;
  }, [mesocycles]);

  const selectSeason = (id: string) => {
    setHasSelectedSeason(true);
    setSeasonId(id);
    router.get(route('desportivo.planeamento'), { season_id: id }, { preserveScroll: true, preserveState: true });
  };

  const submitSeason = () => {
    if (!seasonDraft.nome || !seasonDraft.ano_temporada || !seasonDraft.data_inicio || !seasonDraft.data_fim) return;

    if (editingSeasonId) {
      router.put(route('desportivo.epoca.update', editingSeasonId), seasonDraft, { preserveScroll: true });
    } else {
      router.post(route('desportivo.epoca.store'), seasonDraft, { preserveScroll: true });
    }
  };

  const startCreateSeason = () => {
    setEditingSeasonId(null);
    setSeasonDraft({
      nome: '',
      ano_temporada: '',
      data_inicio: '',
      data_fim: '',
      tipo: 'Principal',
      estado: 'Planeada',
    });
    setShowSeasonForm(true);
  };

  const startEditSeason = (season: Season) => {
    setEditingSeasonId(season.id);
    setSeasonDraft({
      nome: season.nome,
      ano_temporada: season.ano_temporada,
      data_inicio: normalizeDateInput(season.data_inicio),
      data_fim: normalizeDateInput(season.data_fim),
      tipo: season.tipo,
      estado: season.estado,
    });
    setShowSeasonForm(true);
  };

  const removeSeason = (id: string) => {
    if (!window.confirm('Eliminar esta época desportiva?')) return;
    router.delete(route('desportivo.epoca.delete', id), { preserveScroll: true });
  };

  const submitMacro = () => {
    if (!seasonId || !macroDraft.nome || !macroDraft.data_inicio || !macroDraft.data_fim || !macroDraft.objetivo_principal) return;

    const payload = {
      epoca_id: seasonId,
      nome: macroDraft.nome,
      data_inicio: macroDraft.data_inicio,
      data_fim: macroDraft.data_fim,
      objetivo_principal: macroDraft.objetivo_principal,
      objetivo_secundario: macroDraft.objetivo_secundario || null,
      tipo: macroDraft.tipo,
    };

    if (macroDraft.id) {
      router.put(route('desportivo.macrociclo.update', macroDraft.id), payload, { preserveScroll: true });
    } else {
      router.post(route('desportivo.macrociclo.store'), payload, { preserveScroll: true });
    }

    setMacroDialogOpen(false);
    resetMacroForm();
  };

  const editMacro = (macro: Macrocycle) => {
    setMacroDraft({
      id: macro.id,
      nome: macro.nome,
      data_inicio: normalizeDateInput(macro.data_inicio),
      data_fim: normalizeDateInput(macro.data_fim),
      objetivo_principal: macro.objetivo_principal ?? macro.tipo ?? '',
      objetivo_secundario: macro.objetivo_secundario ?? '',
      tipo: macro.tipo,
    });
    setMacroDialogOpen(true);
  };

  const resetMacroForm = () => {
    setMacroDraft({
      id: '',
      nome: '',
      data_inicio: '',
      data_fim: '',
      objetivo_principal: '',
      objetivo_secundario: '',
      tipo: 'Preparação geral',
    });
  };

  const removeMacro = (id: string) => {
    if (!window.confirm('Eliminar este macrociclo?')) return;
    router.delete(route('desportivo.macrociclo.delete', id), { preserveScroll: true });
  };

  const submitMeso = () => {
    if (!seasonId || !mesoDraft.macrociclo_id || !mesoDraft.nome || !mesoDraft.data_inicio || !mesoDraft.data_fim || !mesoDraft.objetivo_principal) return;

    const payload = {
      epoca_id: seasonId,
      macrociclo_id: mesoDraft.macrociclo_id,
      nome: mesoDraft.nome,
      data_inicio: mesoDraft.data_inicio,
      data_fim: mesoDraft.data_fim,
      objetivo_principal: mesoDraft.objetivo_principal,
      objetivo_secundario: mesoDraft.objetivo_secundario || null,
    };

    if (mesoDraft.id) {
      router.put(route('desportivo.mesociclo.update', mesoDraft.id), payload, { preserveScroll: true });
    } else {
      router.post(route('desportivo.mesociclo.store'), payload, { preserveScroll: true });
    }

    setMesoDialogOpen(false);
    setMesoDraft({ id: '', macrociclo_id: '', nome: '', data_inicio: '', data_fim: '', objetivo_principal: '', objetivo_secundario: '' });
  };

  const startCreateMeso = (macroId: string) => {
    setMesoDraft({
      id: '',
      macrociclo_id: macroId,
      nome: '',
      data_inicio: '',
      data_fim: '',
      objetivo_principal: '',
      objetivo_secundario: '',
    });
    setMesoDialogOpen(true);
  };

  const editMeso = (meso: MesocyclePlan) => {
    setMesoDraft({
      id: meso.id,
      macrociclo_id: meso.macrociclo_id,
      nome: meso.nome,
      data_inicio: normalizeDateInput(meso.data_inicio),
      data_fim: normalizeDateInput(meso.data_fim),
      objetivo_principal: meso.objetivo_principal ?? '',
      objetivo_secundario: meso.objetivo_secundario ?? '',
    });
    setMesoDialogOpen(true);
  };

  const removeMeso = (id: string) => {
    if (!seasonId || !window.confirm('Eliminar este mesociclo?')) return;
    router.delete(route('desportivo.mesociclo.delete', id), {
      data: { epoca_id: seasonId },
      preserveScroll: true,
    });
  };

  const toggleMacroExpanded = (id: string) => {
    setExpandedMacroIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-3">
      <SectionTitle
        title="Planeamento Desportivo"
        subtitle="Gestão operacional por Época, Macrociclo e Mesociclo com visão temporal tipo Gantt."
      />

      <div className="grid gap-3 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">Épocas desportivas</CardTitle>
              <Button size="sm" onClick={startCreateSeason}>Adicionar época</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {showSeasonForm && (
              <div className="border rounded-md p-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <Label className="text-xs">Título da época</Label>
                    <Input value={seasonDraft.nome} onChange={(e) => setSeasonDraft((prev) => ({ ...prev, nome: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Ano</Label>
                    <Input placeholder="2025/2026" value={seasonDraft.ano_temporada} onChange={(e) => setSeasonDraft((prev) => ({ ...prev, ano_temporada: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Tipo</Label>
                    <select
                      value={seasonDraft.tipo}
                      onChange={(e) => setSeasonDraft((prev) => ({ ...prev, tipo: e.target.value }))}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="Principal">Principal</option>
                      <option value="Secundária">Secundária</option>
                      <option value="Época de Verão">Época de Verão</option>
                      <option value="Preparação">Preparação</option>
                      <option value="Pré-Época">Pré-Época</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Data início</Label>
                    <Input type="date" value={seasonDraft.data_inicio} onChange={(e) => setSeasonDraft((prev) => ({ ...prev, data_inicio: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Data fim</Label>
                    <Input type="date" value={seasonDraft.data_fim} onChange={(e) => setSeasonDraft((prev) => ({ ...prev, data_fim: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Estado</Label>
                    <select
                      value={seasonDraft.estado}
                      onChange={(e) => setSeasonDraft((prev) => ({ ...prev, estado: e.target.value }))}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="Planeada">Planeada</option>
                      <option value="Em curso">Em curso</option>
                      <option value="Concluída">Concluída</option>
                      <option value="Arquivada">Arquivada</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={submitSeason}>{editingSeasonId ? 'Guardar edição' : 'Criar época'}</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowSeasonForm(false);
                      setEditingSeasonId(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {seasons.map((season) => (
              <div
                key={season.id}
                className={`border rounded-md p-2 ${season.id === seasonId ? 'border-primary/40 bg-muted/30' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button type="button" onClick={() => selectSeason(season.id)} className="flex-1 text-left">
                    <p className="font-medium text-sm">{season.nome}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{formatDateRange(season.data_inicio, season.data_fim)}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{season.estado}</p>
                  </button>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => startEditSeason(season)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => removeSeason(season.id)}>
                      Apagar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {seasons.length === 0 && <p className="text-muted-foreground">Sem épocas no backend.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">Macrociclos da época selecionada</CardTitle>
              {hasSelectedSeason && (
                <Button
                  size="sm"
                  onClick={() => {
                    resetMacroForm();
                    setMacroDialogOpen(true);
                  }}
                >
                  Novo macrociclo
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {!hasSelectedSeason && (
              <div className="border rounded-md p-4">
                <p className="text-xs text-muted-foreground">Seleciona uma época no card da esquerda para carregar macrociclos e mesociclos.</p>
              </div>
            )}

            {hasSelectedSeason && (
              <div className="space-y-2">
              {seasonMacros.map((macro) => {
                const state = macroState(macro.data_inicio, macro.data_fim);
                const isExpanded = expandedMacroIds.includes(macro.id);
                const macroMesos = mesocyclesByMacro.get(macro.id) ?? [];

                return (
                  <div key={macro.id} className="border rounded-md p-2 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <button type="button" onClick={() => toggleMacroExpanded(macro.id)} className="text-left flex-1">
                        <p className="text-xs font-semibold">{macro.nome}</p>
                        <p className="text-[11px] text-muted-foreground">{formatDateRange(macro.data_inicio, macro.data_fim)}</p>
                        <p className="text-[11px] text-muted-foreground">Objetivo principal: {macro.objetivo_principal || macro.tipo || '—'}</p>
                        {macro.objetivo_secundario && (
                          <p className="text-[11px] text-muted-foreground">Objetivo secundário: {macro.objetivo_secundario}</p>
                        )}
                      </button>
                      <div className="flex items-center gap-1">
                        <Badge variant={macroStateBadge(state)} className="text-[10px]">{state}</Badge>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => editMacro(macro)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => removeMacro(macro.id)}>
                          Apagar
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-2 border-t pt-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium">Mesociclos</p>
                          <Button size="sm" variant="outline" onClick={() => startCreateMeso(macro.id)}>Novo mesociclo</Button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left border-b">
                                <th className="py-1 pr-2 font-medium">Nome</th>
                                <th className="py-1 pr-2 font-medium">Início</th>
                                <th className="py-1 pr-2 font-medium">Fim</th>
                                <th className="py-1 pr-2 font-medium">Objetivo principal</th>
                                <th className="py-1 pr-2 font-medium">Objetivo secundário</th>
                                <th className="py-1 font-medium">Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {macroMesos.map((meso) => (
                                <tr key={meso.id} className="border-b last:border-b-0">
                                  <td className="py-1 pr-2">{meso.nome}</td>
                                  <td className="py-1 pr-2">{(meso.data_inicio ?? '').slice(0, 10)}</td>
                                  <td className="py-1 pr-2">{(meso.data_fim ?? '').slice(0, 10)}</td>
                                  <td className="py-1 pr-2">{meso.objetivo_principal || '—'}</td>
                                  <td className="py-1 pr-2">{meso.objetivo_secundario || '—'}</td>
                                  <td className="py-1">
                                    <div className="flex gap-1">
                                      <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => editMeso(meso)}>
                                        Editar
                                      </Button>
                                      <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => removeMeso(meso.id)}>
                                        Apagar
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {macroMesos.length === 0 && (
                                <tr>
                                  <td className="py-2 text-muted-foreground" colSpan={6}>Sem mesociclos neste macrociclo.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {seasonMacros.length === 0 && (
                  <div className="border rounded-md p-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">Sem macrociclos para a época selecionada.</p>
                    <Button
                      size="sm"
                      onClick={() => {
                        resetMacroForm();
                        setMacroDialogOpen(true);
                      }}
                    >
                      Criar novo macrociclo
                    </Button>
                  </div>
              )}
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      {hasSelectedSeason && <AnnualCycleCalendar macrocycles={seasonMacros} mesocycles={mesocycles} />}

      <Dialog open={macroDialogOpen} onOpenChange={setMacroDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{macroDraft.id ? 'Editar macrociclo' : 'Novo macrociclo'}</DialogTitle>
            <DialogDescription>
              Define o período e os objetivos do macrociclo selecionado para a época ativa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label className="text-xs">Nome macrociclo</Label>
                <Input value={macroDraft.nome} onChange={(e) => setMacroDraft((prev) => ({ ...prev, nome: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Data início</Label>
                <Input type="date" value={macroDraft.data_inicio} onChange={(e) => setMacroDraft((prev) => ({ ...prev, data_inicio: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Data fim</Label>
                <Input type="date" value={macroDraft.data_fim} onChange={(e) => setMacroDraft((prev) => ({ ...prev, data_fim: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Objetivo principal</Label>
                <Input value={macroDraft.objetivo_principal} onChange={(e) => setMacroDraft((prev) => ({ ...prev, objetivo_principal: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Objetivo secundário</Label>
                <Input value={macroDraft.objetivo_secundario} onChange={(e) => setMacroDraft((prev) => ({ ...prev, objetivo_secundario: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">Tipo</Label>
                <Input value={macroDraft.tipo} onChange={(e) => setMacroDraft((prev) => ({ ...prev, tipo: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={submitMacro}>{macroDraft.id ? 'Guardar edição' : 'Criar macrociclo'}</Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setMacroDialogOpen(false);
                  resetMacroForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={mesoDialogOpen} onOpenChange={setMesoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mesoDraft.id ? 'Editar mesociclo' : 'Novo mesociclo'}</DialogTitle>
            <DialogDescription>
              Regista o mesociclo associado ao macrociclo expandido com datas e objetivos operacionais.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label className="text-xs">Nome</Label>
                <Input value={mesoDraft.nome} onChange={(e) => setMesoDraft((prev) => ({ ...prev, nome: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Data início</Label>
                <Input type="date" value={mesoDraft.data_inicio} onChange={(e) => setMesoDraft((prev) => ({ ...prev, data_inicio: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Data fim</Label>
                <Input type="date" value={mesoDraft.data_fim} onChange={(e) => setMesoDraft((prev) => ({ ...prev, data_fim: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Objetivo principal</Label>
                <Input value={mesoDraft.objetivo_principal} onChange={(e) => setMesoDraft((prev) => ({ ...prev, objetivo_principal: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Objetivo secundário</Label>
                <Input value={mesoDraft.objetivo_secundario} onChange={(e) => setMesoDraft((prev) => ({ ...prev, objetivo_secundario: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={submitMeso}>{mesoDraft.id ? 'Guardar mesociclo' : 'Criar mesociclo'}</Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setMesoDialogOpen(false);
                  setMesoDraft({ id: '', macrociclo_id: '', nome: '', data_inicio: '', data_fim: '', objetivo_principal: '', objetivo_secundario: '' });
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
