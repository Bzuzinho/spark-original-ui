import { FormEvent, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Plus, X } from '@phosphor-icons/react';

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
}

interface Season {
  id: string;
  nome: string;
}

interface DesportivoTreinosProps {
  trainings?: { data: Training[] };
  selectedSeason?: Season | null;
}

export function DesportivoTreinos({
  trainings = { data: [] },
  selectedSeason = null,
}: DesportivoTreinosProps) {
  const [newTrainingOpen, setNewTrainingOpen] = useState(false);

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

  const onTrainingSubmit = (e: FormEvent) => {
    e.preventDefault();
    trainingForm.post(route('desportivo.treino.store'), {
      onSuccess: () => setNewTrainingOpen(false),
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

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="escaloes">Escalões (IDs separados por vírgula)</Label>
                  <Input
                    id="escaloes"
                    onChange={(e) =>
                      trainingForm.setData(
                        'escaloes',
                        e.target.value
                          .split(',')
                          .map((v) => v.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="uuid1, uuid2..."
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao_treino">Descrição do Treino</Label>
                <Textarea
                  id="descricao_treino"
                  value={trainingForm.data.descricao_treino}
                  onChange={(e) => trainingForm.setData('descricao_treino', e.target.value)}
                  placeholder="Descreva o treino..."
                  rows={3}
                  className="bg-white"
                />
              </div>

              <Button type="submit" size="sm">
                Guardar Treino
              </Button>
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
                      {t.data} {t.hora_inicio ?? ''} - {t.hora_fim ?? ''} | {t.local ?? 'Sem local'}
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
                      onClick={() => router.post(route('desportivo.treino.duplicate', t.id))}
                    >
                      Duplicar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => router.delete(route('desportivo.treino.delete', t.id))}
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
    </div>
  );
}
