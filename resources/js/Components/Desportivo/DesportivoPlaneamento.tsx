import { FormEvent, Fragment, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { toast } from 'sonner';

interface Season {
  id: string;
  nome: string;
  ano_temporada: string;
  estado: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  macrocycles?: Macrocycle[];
}

interface Macrocycle {
  id: string;
  nome: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  escalao?: string | null;
}

interface DesportivoPlaneamentoProps {
  seasons?: Season[];
  selectedSeason?: Season | null;
  macrocycles?: Macrocycle[];
}

const toInputDate = (value?: string | null): string => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const formatDisplayDate = (value?: string | null): string => {
  const inputDate = toInputDate(value);
  if (!inputDate) return '-';
  const [year, month, day] = inputDate.split('-');
  return `${day}/${month}/${year}`;
};

export function DesportivoPlaneamento({
  seasons = [],
  selectedSeason = null,
  macrocycles = [],
}: DesportivoPlaneamentoProps) {
  const [expandedSeasonIds, setExpandedSeasonIds] = useState<string[]>(
    selectedSeason ? [selectedSeason.id] : []
  );
  const [seasonDialogOpen, setSeasonDialogOpen] = useState(false);
  const [seasonEditingId, setSeasonEditingId] = useState<string | null>(null);
  const [macrocycleDialogOpen, setMacrocycleDialogOpen] = useState(false);
  const [macrocycleEditingId, setMacrocycleEditingId] = useState<string | null>(null);
  const [macrocycleTargetSeasonId, setMacrocycleTargetSeasonId] = useState<string>(
    selectedSeason?.id ?? ''
  );

  const seasonForm = useForm({
    nome: '',
    ano_temporada: '',
    data_inicio: '',
    data_fim: '',
    tipo: 'Principal',
    estado: 'Planeada',
    piscina_principal: '',
    descricao: '',
  });

  const macrocycleForm = useForm({
    epoca_id: selectedSeason?.id ?? '',
    nome: '',
    tipo: 'Preparação geral',
    data_inicio: '',
    data_fim: '',
    escalao: '',
  });

  const resetSeasonForm = () => {
    seasonForm.reset();
    seasonForm.setData({
      nome: '',
      ano_temporada: '',
      data_inicio: '',
      data_fim: '',
      tipo: 'Principal',
      estado: 'Planeada',
      piscina_principal: '',
      descricao: '',
    });
  };

  const resetMacrocycleForm = (seasonId: string) => {
    macrocycleForm.reset();
    macrocycleForm.setData({
      epoca_id: seasonId,
      nome: '',
      tipo: 'Preparação geral',
      data_inicio: '',
      data_fim: '',
      escalao: '',
    });
  };

  const toggleSeason = (seasonId: string) => {
    setExpandedSeasonIds((prev) =>
      prev.includes(seasonId) ? prev.filter((id) => id !== seasonId) : [...prev, seasonId]
    );
  };

  const openCreateSeasonDialog = () => {
    setSeasonEditingId(null);
    resetSeasonForm();
    setSeasonDialogOpen(true);
  };

  const openEditSeasonDialog = (season: Season) => {
    setSeasonEditingId(season.id);
    seasonForm.setData({
      nome: season.nome,
      ano_temporada: season.ano_temporada,
      data_inicio: toInputDate(season.data_inicio),
      data_fim: toInputDate(season.data_fim),
      tipo: season.tipo,
      estado: season.estado,
      piscina_principal: '',
      descricao: '',
    });
    setSeasonDialogOpen(true);
  };

  const openCreateMacrocycleDialog = (seasonId: string) => {
    setMacrocycleEditingId(null);
    setMacrocycleTargetSeasonId(seasonId);
    resetMacrocycleForm(seasonId);
    setMacrocycleDialogOpen(true);
  };

  const openEditMacrocycleDialog = (seasonId: string, macrocycle: Macrocycle) => {
    setMacrocycleEditingId(macrocycle.id);
    setMacrocycleTargetSeasonId(seasonId);
    macrocycleForm.setData({
      epoca_id: seasonId,
      nome: macrocycle.nome,
      tipo: macrocycle.tipo,
      data_inicio: toInputDate(macrocycle.data_inicio),
      data_fim: toInputDate(macrocycle.data_fim),
      escalao: macrocycle.escalao ?? '',
    });
    setMacrocycleDialogOpen(true);
  };

  const deleteSeason = (seasonId: string) => {
    if (!window.confirm('Tem a certeza que deseja eliminar esta época?')) {
      return;
    }

    router.delete(route('desportivo.epoca.delete', seasonId), {
      onSuccess: () => toast.success('Época eliminada com sucesso!'),
      onError: () => toast.error('Erro ao eliminar época.'),
    });
  };

  const deleteMacrocycle = (macrocycleId: string) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este macrociclo?')) {
      return;
    }

    router.delete(route('desportivo.macrociclo.delete', macrocycleId), {
      onSuccess: () => toast.success('Macrociclo eliminado com sucesso!'),
      onError: () => toast.error('Erro ao eliminar macrociclo.'),
    });
  };

  const onSeasonSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (seasonEditingId) {
      seasonForm.put(route('desportivo.epoca.update', seasonEditingId), {
        onSuccess: () => {
          setSeasonDialogOpen(false);
          setSeasonEditingId(null);
          resetSeasonForm();
          toast.success('Época atualizada com sucesso!');
        },
        onError: () => toast.error('Erro ao atualizar época.'),
      });
      return;
    }

    seasonForm.post(route('desportivo.epoca.store'), {
      onSuccess: () => {
        setSeasonDialogOpen(false);
        resetSeasonForm();
        toast.success('Época criada com sucesso!');
      },
      onError: () => toast.error('Erro ao criar época.'),
    });
  };

  const onMacrocycleSubmit = (e: FormEvent) => {
    e.preventDefault();
    macrocycleForm.transform((data) => ({
      ...data,
      epoca_id: macrocycleTargetSeasonId,
    }));

    if (macrocycleEditingId) {
      macrocycleForm.put(route('desportivo.macrociclo.update', macrocycleEditingId), {
        onSuccess: () => {
          setMacrocycleDialogOpen(false);
          setMacrocycleEditingId(null);
          resetMacrocycleForm(macrocycleTargetSeasonId);
          toast.success('Macrociclo atualizado com sucesso!');
        },
        onError: () => toast.error('Erro ao atualizar macrociclo.'),
      });
      return;
    }

    macrocycleForm.post(route('desportivo.macrociclo.store'), {
      onSuccess: () => {
        setMacrocycleDialogOpen(false);
        resetMacrocycleForm(macrocycleTargetSeasonId);
        toast.success('Macrociclo criado com sucesso!');
      },
      onError: () => toast.error('Erro ao criar macrociclo.'),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Épocas</CardTitle>
          <Button size="sm" onClick={openCreateSeasonDialog}>
            Criar Nova Época
          </Button>
        </CardHeader>
        <CardContent>
          {seasons.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma época criada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ano/Temporada</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seasons.map((season) => {
                  const isExpanded = expandedSeasonIds.includes(season.id);
                  const seasonMacrocycles = season.macrocycles ?? (selectedSeason?.id === season.id ? macrocycles : []);

                  return (
                    <Fragment key={season.id}>
                      <TableRow key={season.id} className={isExpanded ? 'bg-muted/30' : ''}>
                        <TableCell className="font-medium">{season.nome}</TableCell>
                        <TableCell>{season.ano_temporada}</TableCell>
                        <TableCell>{season.tipo}</TableCell>
                        <TableCell>{season.estado}</TableCell>
                        <TableCell>
                          {formatDisplayDate(season.data_inicio)} a {formatDisplayDate(season.data_fim)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => toggleSeason(season.id)}
                            >
                              {isExpanded ? 'Recolher' : `Expandir (${seasonMacrocycles.length})`}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => openEditSeasonDialog(season)}
                            >
                              Editar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteSeason(season.id)}
                            >
                              Apagar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow key={`${season.id}-macrocycles`}>
                          <TableCell colSpan={6} className="bg-muted/10">
                            <div className="rounded-md border border-dashed border-primary/30 p-3 space-y-3 ml-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold">Macrociclos</h4>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => openCreateMacrocycleDialog(season.id)}
                                >
                                  Criar Novo Macrociclo
                                </Button>
                              </div>

                              {seasonMacrocycles.length === 0 ? (
                                <p className="text-xs text-muted-foreground">Nenhum macrociclo criado</p>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Nome</TableHead>
                                      <TableHead>Tipo</TableHead>
                                      <TableHead>Período</TableHead>
                                      <TableHead>Escalão</TableHead>
                                      <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {seasonMacrocycles.map((macrocycle) => (
                                      <TableRow key={macrocycle.id} className="bg-background">
                                        <TableCell className="font-medium">{macrocycle.nome}</TableCell>
                                        <TableCell>{macrocycle.tipo}</TableCell>
                                        <TableCell>
                                          {formatDisplayDate(macrocycle.data_inicio)} a {formatDisplayDate(macrocycle.data_fim)}
                                        </TableCell>
                                        <TableCell>{macrocycle.escalao || '-'}</TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex items-center justify-end gap-2">
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="outline"
                                              onClick={() => openEditMacrocycleDialog(season.id, macrocycle)}
                                            >
                                              Editar
                                            </Button>
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="destructive"
                                              onClick={() => deleteMacrocycle(macrocycle.id)}
                                            >
                                              Apagar
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={seasonDialogOpen} onOpenChange={setSeasonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{seasonEditingId ? 'Editar Época' : 'Criar Nova Época'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSeasonSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={seasonForm.data.nome}
                  onChange={(e) => seasonForm.setData('nome', e.target.value)}
                  placeholder="Nome da época"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ano_temporada">Ano/Temporada</Label>
                <Input
                  id="ano_temporada"
                  value={seasonForm.data.ano_temporada}
                  onChange={(e) => seasonForm.setData('ano_temporada', e.target.value)}
                  placeholder="2024/2025"
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={seasonForm.data.data_inicio}
                  onChange={(e) => seasonForm.setData('data_inicio', e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_fim">Data Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={seasonForm.data.data_fim}
                  onChange={(e) => seasonForm.setData('data_fim', e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSeasonDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={seasonForm.processing}>
                {seasonEditingId ? 'Guardar' : 'Criar Época'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={macrocycleDialogOpen} onOpenChange={setMacrocycleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{macrocycleEditingId ? 'Editar Macrociclo' : 'Criar Novo Macrociclo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onMacrocycleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="macro_nome">Nome</Label>
                <Input
                  id="macro_nome"
                  value={macrocycleForm.data.nome}
                  onChange={(e) => macrocycleForm.setData('nome', e.target.value)}
                  placeholder="Nome do macrociclo"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="macro_tipo">Tipo</Label>
                <Input
                  id="macro_tipo"
                  value={macrocycleForm.data.tipo}
                  onChange={(e) => macrocycleForm.setData('tipo', e.target.value)}
                  placeholder="Preparação geral, Específico..."
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="macro_data_inicio">Data Início</Label>
                <Input
                  id="macro_data_inicio"
                  type="date"
                  value={macrocycleForm.data.data_inicio}
                  onChange={(e) => macrocycleForm.setData('data_inicio', e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="macro_data_fim">Data Fim</Label>
                <Input
                  id="macro_data_fim"
                  type="date"
                  value={macrocycleForm.data.data_fim}
                  onChange={(e) => macrocycleForm.setData('data_fim', e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="escalao">Escalão</Label>
              <Input
                id="escalao"
                value={macrocycleForm.data.escalao}
                onChange={(e) => macrocycleForm.setData('escalao', e.target.value)}
                placeholder="Escalão"
                className="bg-white"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMacrocycleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={macrocycleForm.processing}>
                {macrocycleEditingId ? 'Guardar' : 'Criar Macrociclo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
