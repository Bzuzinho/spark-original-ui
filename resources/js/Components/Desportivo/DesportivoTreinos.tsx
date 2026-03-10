import { FormEvent, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Plus, X } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface Training {
  id: string;
  numero_treino?: string | null;
  data: string;
  hora_inicio?: string | null;
  hora_fim?: string | null;
  local?: string | null;
  tipo_treino: string;
  volume_planeado_m?: number | null;
  descricao_treino?: string | null;
  notas_gerais?: string | null;
  escaloes?: string[] | null;
}

interface Season {
  id: string;
  nome: string;
}

interface AgeGroup {
  id: string;
  nome: string;
}

interface DesportivoTreinosProps {
  trainings?: { data: Training[] };
  selectedSeason?: Season | null;
  ageGroups?: AgeGroup[];
}

export function DesportivoTreinos({
  trainings = { data: [] },
  selectedSeason = null,
  ageGroups = [],
}: DesportivoTreinosProps) {
  const [newTrainingOpen, setNewTrainingOpen] = useState(false);
  const [viewTraining, setViewTraining] = useState<Training | null>(null);
  const [editTrainingId, setEditTrainingId] = useState<string | null>(null);

  const normalizeTime = (value?: string | null) => {
    if (!value) return '';
    return value.length >= 5 ? value.slice(0, 5) : value;
  };

  const trainingForm = useForm({
    numero_treino: '',
    data: '',
    hora_inicio: '09:00',
    hora_fim: '10:00',
    local: '',
    epoca_id: selectedSeason?.id ?? '',
    escaloes: [] as string[],
    tipo_treino: 'Técnico',
    volume_planeado_m: '',
    descricao_treino: '',
    notas_gerais: '',
  });

  const editTrainingForm = useForm({
    numero_treino: '',
    data: '',
    hora_inicio: '09:00',
    hora_fim: '10:00',
    local: '',
    epoca_id: selectedSeason?.id ?? '',
    escaloes: [] as string[],
    tipo_treino: 'Técnico',
    volume_planeado_m: '',
    descricao_treino: '',
    notas_gerais: '',
  });

  const onTrainingSubmit = (e: FormEvent) => {
    e.preventDefault();
    trainingForm.post(route('desportivo.treino.store'), {
      onSuccess: () => {
        setNewTrainingOpen(false);
        toast.success('Treino criado com sucesso!');
      },
      onError: () => toast.error('Erro ao criar treino.'),
    });
  };

  const openEditTraining = (training: Training) => {
    setEditTrainingId(training.id);
    editTrainingForm.setData({
      numero_treino: training.numero_treino ?? '',
      data: training.data,
      hora_inicio: normalizeTime(training.hora_inicio) || '09:00',
      hora_fim: normalizeTime(training.hora_fim) || '10:00',
      local: training.local ?? '',
      epoca_id: selectedSeason?.id ?? '',
      escaloes: training.escaloes ?? [],
      tipo_treino: training.tipo_treino,
      volume_planeado_m: training.volume_planeado_m?.toString() ?? '',
      descricao_treino: training.descricao_treino ?? '',
      notas_gerais: training.notas_gerais ?? '',
    });
  };

  const onEditTrainingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editTrainingId) return;

    editTrainingForm.put(route('desportivo.treino.update', editTrainingId), {
      onSuccess: () => {
        setEditTrainingId(null);
        toast.success('Treino atualizado com sucesso!');
      },
      onError: () => toast.error('Erro ao atualizar treino.'),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-base">Treinos</CardTitle>
          <Button
            size="sm"
            onClick={() => setNewTrainingOpen((v) => !v)}
            className="gap-2"
          >
            {newTrainingOpen ? (
              <>
                <X size={16} weight="bold" />
                Fechar
              </>
            ) : (
              <>
                <Plus size={16} weight="bold" />
                Novo Treino
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {newTrainingOpen && (
            <form
              onSubmit={onTrainingSubmit}
              className="space-y-4 border rounded-lg p-4 bg-muted/20"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero_treino">Nº Treino</Label>
                  <Input
                    id="numero_treino"
                    value={trainingForm.data.numero_treino}
                    onChange={(e) => trainingForm.setData('numero_treino', e.target.value)}
                    placeholder="Número do treino"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={trainingForm.data.data}
                    onChange={(e) => trainingForm.setData('data', e.target.value)}
                    placeholder="dd/mm/aaaa"
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hora_inicio">Hora Início</Label>
                  <Input
                    id="hora_inicio"
                    type="time"
                    value={trainingForm.data.hora_inicio}
                    onChange={(e) => trainingForm.setData('hora_inicio', e.target.value)}
                    placeholder="--:--"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora_fim">Hora Fim</Label>
                  <Input
                    id="hora_fim"
                    type="time"
                    value={trainingForm.data.hora_fim}
                    onChange={(e) => trainingForm.setData('hora_fim', e.target.value)}
                    placeholder="--:--"
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="local">Local</Label>
                  <Input
                    id="local"
                    value={trainingForm.data.local}
                    onChange={(e) => trainingForm.setData('local', e.target.value)}
                    placeholder="Local do treino"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_treino">Tipo Treino</Label>
                  <Input
                    id="tipo_treino"
                    value={trainingForm.data.tipo_treino}
                    onChange={(e) => trainingForm.setData('tipo_treino', e.target.value)}
                    placeholder="Técnico, Resistência..."
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume_planeado_m">Volume (metros)</Label>
                <Input
                  id="volume_planeado_m"
                  type="number"
                  value={trainingForm.data.volume_planeado_m}
                  onChange={(e) => trainingForm.setData('volume_planeado_m', e.target.value)}
                  placeholder="Volume em metros"
                  className="bg-white"
                />
              </div>

              {ageGroups.length > 0 && (
                <div className="space-y-2">
                  <Label>Escalões</Label>
                  <div className="border rounded-lg p-3 bg-white space-y-2">
                    {ageGroups.map((ageGroup) => (
                      <div key={ageGroup.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`escalao-${ageGroup.id}`}
                          checked={trainingForm.data.escaloes.includes(ageGroup.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              trainingForm.setData('escaloes', [
                                ...trainingForm.data.escaloes,
                                ageGroup.id,
                              ]);
                            } else {
                              trainingForm.setData(
                                'escaloes',
                                trainingForm.data.escaloes.filter((id) => id !== ageGroup.id)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`escalao-${ageGroup.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {ageGroup.nome}
                        </label>
                      </div>
                    ))}
                  </div>
                  {trainingForm.data.escaloes.length === 0 && (
                    <p className="text-xs text-muted-foreground">Selecione pelo menos um escalão</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="descricao_treino">Descrição do Treino</Label>
                <Textarea
                  id="descricao_treino"
                  value={trainingForm.data.descricao_treino}
                  onChange={(e) => trainingForm.setData('descricao_treino', e.target.value)}
                  placeholder="Descreva o treino..."
                  rows={3}
                  className="bg-white"
                  required
                />
                {trainingForm.errors.descricao_treino && (
                  <p className="text-xs text-destructive">{trainingForm.errors.descricao_treino}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewTrainingOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={trainingForm.processing}>
                  {trainingForm.processing ? 'A guardar...' : 'Guardar Treino'}
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {trainings.data.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                Nenhum treino encontrado
              </p>
            ) : (
              trainings.data.map((t) => (
                <div
                  key={t.id}
                  className="border rounded-lg p-3 flex items-center justify-between hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {t.numero_treino || 'Treino'} | {t.tipo_treino}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.data} {normalizeTime(t.hora_inicio) ?? ''} - {normalizeTime(t.hora_fim) ?? ''} | {t.local ?? 'Sem local'}
                    </p>
                    {t.volume_planeado_m && (
                      <p className="text-xs text-muted-foreground">
                        Volume: {t.volume_planeado_m}m
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewTraining(t)}
                    >
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditTraining(t)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.post(route('desportivo.treino.duplicate', t.id), {}, {
                          onSuccess: () => toast.success('Treino duplicado com sucesso!'),
                          onError: () => toast.error('Erro ao duplicar treino.'),
                        })
                      }
                    >
                      Duplicar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        router.delete(route('desportivo.treino.delete', t.id), {
                          onSuccess: () => toast.success('Treino apagado com sucesso!'),
                          onError: () => toast.error('Erro ao apagar treino.'),
                        })
                      }
                    >
                      Apagar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!viewTraining} onOpenChange={(open) => !open && setViewTraining(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Visualizar Treino</DialogTitle>
          </DialogHeader>
          {viewTraining && (
            <div className="space-y-3 text-sm">
              <p><span className="font-semibold">Nº Treino:</span> {viewTraining.numero_treino || '-'}</p>
              <p><span className="font-semibold">Data:</span> {viewTraining.data}</p>
              <p><span className="font-semibold">Hora:</span> {normalizeTime(viewTraining.hora_inicio)} - {normalizeTime(viewTraining.hora_fim)}</p>
              <p><span className="font-semibold">Local:</span> {viewTraining.local || '-'}</p>
              <p><span className="font-semibold">Tipo:</span> {viewTraining.tipo_treino}</p>
              <p><span className="font-semibold">Volume:</span> {viewTraining.volume_planeado_m ? `${viewTraining.volume_planeado_m}m` : '-'}</p>
              <p><span className="font-semibold">Descrição:</span> {viewTraining.descricao_treino || '-'}</p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setViewTraining(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTrainingId} onOpenChange={(open) => !open && setEditTrainingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Treino</DialogTitle>
          </DialogHeader>
          <form onSubmit={onEditTrainingSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_numero_treino">Nº Treino</Label>
                <Input
                  id="edit_numero_treino"
                  value={editTrainingForm.data.numero_treino}
                  onChange={(e) => editTrainingForm.setData('numero_treino', e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_data">Data</Label>
                <Input
                  id="edit_data"
                  type="date"
                  value={editTrainingForm.data.data}
                  onChange={(e) => editTrainingForm.setData('data', e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_hora_inicio">Hora Início</Label>
                <Input
                  id="edit_hora_inicio"
                  type="time"
                  value={editTrainingForm.data.hora_inicio}
                  onChange={(e) => editTrainingForm.setData('hora_inicio', e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_hora_fim">Hora Fim</Label>
                <Input
                  id="edit_hora_fim"
                  type="time"
                  value={editTrainingForm.data.hora_fim}
                  onChange={(e) => editTrainingForm.setData('hora_fim', e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_local">Local</Label>
                <Input
                  id="edit_local"
                  value={editTrainingForm.data.local}
                  onChange={(e) => editTrainingForm.setData('local', e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_tipo_treino">Tipo Treino</Label>
                <Input
                  id="edit_tipo_treino"
                  value={editTrainingForm.data.tipo_treino}
                  onChange={(e) => editTrainingForm.setData('tipo_treino', e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_volume_planeado_m">Volume (metros)</Label>
              <Input
                id="edit_volume_planeado_m"
                type="number"
                value={editTrainingForm.data.volume_planeado_m}
                onChange={(e) => editTrainingForm.setData('volume_planeado_m', e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_descricao_treino">Descrição do Treino</Label>
              <Textarea
                id="edit_descricao_treino"
                value={editTrainingForm.data.descricao_treino}
                onChange={(e) => editTrainingForm.setData('descricao_treino', e.target.value)}
                rows={3}
                className="bg-white"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTrainingId(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={editTrainingForm.processing}>
                {editTrainingForm.processing ? 'A guardar...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
