import { useEffect, useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Badge } from '@/Components/ui/badge';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Textarea } from '@/Components/ui/textarea';
import { Separator } from '@/Components/ui/separator';
import { Users, FilePdf } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@/hooks/useKV';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConvocationGroup {
  evento_id: string;
  evento_titulo: string;
  evento_data: string;
  evento_tipo: string;
  convocations: any[];
}

interface Prova {
  id: string;
  name?: string;
  nome?: string;
  distancia?: number;
  unidade?: string;
  modalidade?: string;
}

interface CostCenter {
  id: string;
  nome: string;
  ativo?: boolean;
}

interface EditConvocatoriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: ConvocationGroup | null;
  events: any[];
  users: any[];
  costCenters: CostCenter[];
}

export function EditConvocatoriaDialog({
  open,
  onOpenChange,
  group,
  events = [],
  users = [],
  costCenters = [],
}: EditConvocatoriaDialogProps) {
  const { auth } = usePage<any>().props;
  const currentUserId = auth?.user?.id;

  const [step, setStep] = useState(1);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [horaEncontro, setHoraEncontro] = useState('');
  const [localEncontro, setLocalEncontro] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [centroCustoId, setCentroCustoId] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [convocationGroups, setConvocationGroups] = useKV<any[]>('club-convocatorias-grupo', []);

  // Carregar dados do grupo quando abre
  useEffect(() => {
    if (group && open) {
      const groupData = convocationGroups.find((g: any) => {
        // Matching by event and athletes to identify the group
        return g.evento_id === group.evento_id;
      });

      if (groupData) {
        setHoraEncontro(groupData.hora_encontro || '');
        setLocalEncontro(groupData.local_encontro || '');
        setObservacoes(groupData.observacoes || '');
        setCentroCustoId(groupData.centro_custo_id || 'none');
        
        const athleteIds = group.convocations.map((c: any) => c.user_id);
        setSelectedAthletes(athleteIds);
      }
    }
  }, [group, open, convocationGroups]);

  const handleSave = async () => {
    if (!group) return;

    setIsSubmitting(true);
    try {
      // Atualizar grupo
      const updatedGroups = convocationGroups.map((g: any) => {
        if (g.evento_id === group.evento_id) {
          return {
            ...g,
            hora_encontro: horaEncontro || null,
            local_encontro: localEncontro || null,
            observacoes: observacoes || null,
            centro_custo_id: centroCustoId === 'none' ? null : centroCustoId,
          };
        }
        return g;
      });

      setConvocationGroups(updatedGroups);

      toast.success('Convocatória atualizada com sucesso!');
      onOpenChange(false);
      setStep(1);
    } catch (error: any) {
      console.error('Erro ao atualizar convocatória:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar convocatória');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!group) return null;

  const selectedEvent = events.find((e) => e.id === group.evento_id);
  const eventCost = selectedEvent?.taxa_inscricao || 0;
  const totalCost = selectedAthletes.length * eventCost;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Convocatória - Passo {step} de 3</DialogTitle>
          <DialogDescription>
            {group.evento_titulo} - {format(new Date(group.evento_data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Passo 1: Informações Logísticas */}
          {step === 1 && (
            <div className="space-y-4">
              <Label>Hora de Encontro</Label>
              <Input
                type="time"
                value={horaEncontro}
                onChange={(e) => setHoraEncontro(e.target.value)}
                placeholder="HH:mm"
                className="text-xs bg-white"
              />

              <Label>Local de Encontro</Label>
              <Input
                value={localEncontro}
                onChange={(e) => setLocalEncontro(e.target.value)}
                placeholder="Ex: Sede do Clube"
                className="text-xs bg-white"
              />

              <Label>Centro de Custos</Label>
              <Select value={centroCustoId} onValueChange={setCentroCustoId}>
                <SelectTrigger className="text-xs bg-white">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem Centro de Custos</SelectItem>
                  {costCenters.map((cc) => (
                    <SelectItem key={cc.id} value={cc.id}>
                      {cc.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>Observações</Label>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Notas adicionais..."
                className="text-xs bg-white"
                rows={3}
              />
            </div>
          )}

          {/* Passo 2: Resumo da Convocatória */}
          {step === 2 && (
            <div className="space-y-4">
              <Card className="p-3 bg-slate-50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Evento:</span>
                    <p className="font-semibold">{group.evento_titulo}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data:</span>
                    <p className="font-semibold">{format(new Date(group.evento_data), 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Atletas:</span>
                    <p className="font-semibold">{selectedAthletes.length}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Custo Total:</span>
                    <p className="font-semibold">€{totalCost.toFixed(2)}</p>
                  </div>
                  {horaEncontro && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Hora de Encontro:</span>
                      <p className="font-semibold">{horaEncontro}</p>
                    </div>
                  )}
                  {localEncontro && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Local de Encontro:</span>
                      <p className="font-semibold">{localEncontro}</p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-50 p-3 font-semibold text-sm">Atletas Convocados</div>
                <ScrollArea className="h-64">
                  <div className="space-y-2 p-3">
                    {group.convocations.map((conv) => (
                      <div key={conv.id} className="flex items-center justify-between p-2 border rounded text-sm">
                        <span>{conv.user?.nome_completo || 'N/A'}</span>
                        <Badge variant={conv.estado_confirmacao === 'confirmado' ? 'default' : 'secondary'}>
                          {conv.estado_confirmacao}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Passo 3: Confirmação */}
          {step === 3 && (
            <div className="space-y-4">
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-sm mb-3">Resumo das Alterações</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Hora de Encontro:</span>
                    <p className="font-semibold">{horaEncontro || '---'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Local de Encontro:</span>
                    <p className="font-semibold">{localEncontro || '---'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Centro de Custos:</span>
                    <p className="font-semibold">
                      {centroCustoId === 'none'
                        ? 'Sem Centro de Custos'
                        : costCenters.find((cc) => cc.id === centroCustoId)?.nome || '---'}
                    </p>
                  </div>
                  {observacoes && (
                    <div>
                      <span className="text-muted-foreground">Observações:</span>
                      <p className="font-semibold">{observacoes}</p>
                    </div>
                  )}
                </div>
              </Card>

              <p className="text-sm text-muted-foreground">
                Clique em "Guardar" para confirmar as alterações à convocatória.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 justify-between">
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isSubmitting}>
                Anterior
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {step < 3 && (
              <Button onClick={() => setStep(step + 1)} disabled={isSubmitting}>
                Próximo
              </Button>
            )}

            {step === 3 && (
              <Button onClick={handleSave} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? '⏳ Guardando...' : '✓ Guardar Alterações'}
              </Button>
            )}

            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
