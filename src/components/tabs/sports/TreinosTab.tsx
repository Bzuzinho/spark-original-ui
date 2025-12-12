import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, SwimmingPool, Pencil, Trash, Copy, CaretDown, CaretUp, CalendarBlank } from '@phosphor-icons/react';
import type { Treino, Event } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TreinosTabProps {
  onNavigate?: (view: string, context?: any) => void;
}

export function TreinosTab({ onNavigate }: TreinosTabProps) {
  const [treinos, setTreinos] = useKV<Treino[]>('treinos', []);
  const [events, setEvents] = useKV<Event[]>('club-events', []);
  const [escaloes] = useKV<Array<{ id: string; name: string; minAge: number; maxAge: number }>>('settings-age-groups', []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTreinoId, setEditingTreinoId] = useState<string | null>(null);
  const [expandedTreinos, setExpandedTreinos] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<{
    numero_treino: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
    local: string;
    escaloes: string[];
    tipo_treino: 'aerobio' | 'sprint' | 'tecnica' | 'forca' | 'recuperacao' | 'misto';
    volume_planeado_m: string;
    descricao_treino: string;
  }>({
    numero_treino: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    local: '',
    escaloes: [],
    tipo_treino: 'aerobio',
    volume_planeado_m: '',
    descricao_treino: '',
  });

  const handleSaveTreino = async () => {
    if (!formData.numero_treino || !formData.data || !formData.hora_inicio || !formData.local || formData.escaloes.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (isEditMode && editingTreinoId) {
      const treinoExistente = (treinos || []).find(t => t.id === editingTreinoId);
      
      const treinoAtualizado: Treino = {
        ...treinoExistente!,
        numero_treino: formData.numero_treino,
        data: formData.data,
        hora_inicio: formData.hora_inicio,
        hora_fim: formData.hora_fim || undefined,
        local: formData.local,
        escaloes: formData.escaloes,
        tipo_treino: formData.tipo_treino,
        volume_planeado_m: formData.volume_planeado_m ? parseInt(formData.volume_planeado_m) : undefined,
        descricao_treino: formData.descricao_treino || undefined,
        atualizado_em: new Date().toISOString(),
      };

      await setTreinos((current = []) =>
        current.map(t => t.id === editingTreinoId ? treinoAtualizado : t)
      );

      if (treinoExistente?.evento_id) {
        await setEvents((current = []) =>
          current.map(e => {
            if (e.id === treinoExistente.evento_id) {
              return {
                ...e,
                titulo: `Treino #${formData.numero_treino}`,
                descricao: formData.descricao_treino ? `${formData.tipo_treino.toUpperCase()}\n\n${formData.descricao_treino}` : formData.tipo_treino.toUpperCase(),
                data_inicio: formData.data,
                hora_inicio: formData.hora_inicio,
                hora_fim: formData.hora_fim || undefined,
                local: formData.local,
                escaloes_elegiveis: formData.escaloes,
                atualizado_em: new Date().toISOString(),
              };
            }
            return e;
          })
        );
      }

      toast.success('Treino atualizado com sucesso!');
    } else {
      const novoTreino: Treino = {
        id: crypto.randomUUID(),
        numero_treino: formData.numero_treino,
        data: formData.data,
        hora_inicio: formData.hora_inicio,
        hora_fim: formData.hora_fim || undefined,
        local: formData.local,
        escaloes: formData.escaloes,
        tipo_treino: formData.tipo_treino,
        volume_planeado_m: formData.volume_planeado_m ? parseInt(formData.volume_planeado_m) : undefined,
        descricao_treino: formData.descricao_treino || undefined,
        criado_por: 'admin',
        created_at: new Date().toISOString(),
      };

      const eventoData = new Date(formData.data);
      const now = new Date();
      let estadoEvento: 'agendado' | 'em_curso' | 'concluido' = 'agendado';

      if (eventoData.toDateString() === now.toDateString()) {
        estadoEvento = 'em_curso';
      } else if (eventoData < now) {
        estadoEvento = 'concluido';
      }

      const eventoTreino: Event = {
        id: crypto.randomUUID(),
        titulo: `Treino #${formData.numero_treino}`,
        descricao: formData.descricao_treino ? `${formData.tipo_treino.toUpperCase()}\n\n${formData.descricao_treino}` : formData.tipo_treino.toUpperCase(),
        data_inicio: formData.data,
        hora_inicio: formData.hora_inicio,
        hora_fim: formData.hora_fim || undefined,
        local: formData.local,
        tipo: 'treino',
        escaloes_elegiveis: formData.escaloes,
        estado: estadoEvento,
        criado_por: 'admin',
        criado_em: new Date().toISOString(),
      };

      novoTreino.evento_id = eventoTreino.id;

      await setTreinos((current = []) => [...current, novoTreino]);
      await setEvents((current = []) => [...current, eventoTreino]);

      toast.success('Treino criado e adicionado ao calendário!');
    }

    resetForm();
  };

  const handleEditTreino = (treino: Treino) => {
    setEditingTreinoId(treino.id);
    setIsEditMode(true);
    setFormData({
      numero_treino: treino.numero_treino || '',
      data: treino.data,
      hora_inicio: treino.hora_inicio || '',
      hora_fim: treino.hora_fim || '',
      local: treino.local || '',
      escaloes: treino.escaloes || [],
      tipo_treino: treino.tipo_treino,
      volume_planeado_m: treino.volume_planeado_m ? String(treino.volume_planeado_m) : '',
      descricao_treino: treino.descricao_treino || '',
    });
    setIsDialogOpen(true);
  };

  const handleDuplicateTreino = async (treino: Treino) => {
    setEditingTreinoId(null);
    setIsEditMode(false);
    setFormData({
      numero_treino: `${treino.numero_treino}-CÓPIA`,
      data: treino.data,
      hora_inicio: treino.hora_inicio || '',
      hora_fim: treino.hora_fim || '',
      local: treino.local || '',
      escaloes: treino.escaloes || [],
      tipo_treino: treino.tipo_treino,
      volume_planeado_m: treino.volume_planeado_m ? String(treino.volume_planeado_m) : '',
      descricao_treino: treino.descricao_treino || '',
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTreino = async (treino: Treino) => {
    if (!confirm('Tem certeza que deseja eliminar este treino?')) return;

    await setTreinos((current = []) => current.filter(t => t.id !== treino.id));

    if (treino.evento_id) {
      await setEvents((current = []) => current.filter(e => e.id !== treino.evento_id));
    }

    toast.success('Treino eliminado com sucesso');
  };

  const resetForm = () => {
    setFormData({
      numero_treino: '',
      data: '',
      hora_inicio: '',
      hora_fim: '',
      local: '',
      escaloes: [],
      tipo_treino: 'aerobio',
      volume_planeado_m: '',
      descricao_treino: '',
    });
    setIsEditMode(false);
    setEditingTreinoId(null);
    setIsDialogOpen(false);
  };

  const toggleExpanded = (treinoId: string) => {
    setExpandedTreinos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(treinoId)) {
        newSet.delete(treinoId);
      } else {
        newSet.add(treinoId);
      }
      return newSet;
    });
  };

  const handleEscalaoToggle = (escalaoId: string) => {
    setFormData(prev => ({
      ...prev,
      escaloes: prev.escaloes.includes(escalaoId)
        ? prev.escaloes.filter(id => id !== escalaoId)
        : [...prev.escaloes, escalaoId]
    }));
  };

  const sortedTreinos = [...(treinos || [])].sort((a, b) => {
    const dateA = new Date(`${a.data}T${a.hora_inicio || '00:00'}`);
    const dateB = new Date(`${b.data}T${b.hora_inicio || '00:00'}`);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Treinos Criados</h3>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus size={16} className="mr-1" />
                Novo Treino
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Editar Treino' : 'Novo Treino'}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="numero_treino">Nº de Treino *</Label>
                  <Input
                    id="numero_treino"
                    value={formData.numero_treino}
                    onChange={(e) => setFormData({ ...formData, numero_treino: e.target.value })}
                    placeholder="Ex.: T001, T-25-01-2025"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data">Data *</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipo_treino">Tipo de Treino *</Label>
                    <Select
                      value={formData.tipo_treino}
                      onValueChange={(value: any) => setFormData({ ...formData, tipo_treino: value })}
                    >
                      <SelectTrigger id="tipo_treino">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aerobio">Aeróbio</SelectItem>
                        <SelectItem value="sprint">Sprint</SelectItem>
                        <SelectItem value="tecnica">Técnica</SelectItem>
                        <SelectItem value="forca">Força</SelectItem>
                        <SelectItem value="recuperacao">Recuperação</SelectItem>
                        <SelectItem value="misto">Misto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hora_inicio">Hora de Início *</Label>
                    <Input
                      id="hora_inicio"
                      type="time"
                      value={formData.hora_inicio}
                      onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="hora_fim">Hora de Fim</Label>
                    <Input
                      id="hora_fim"
                      type="time"
                      value={formData.hora_fim}
                      onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="local">Local *</Label>
                  <Input
                    id="local"
                    value={formData.local}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    placeholder="Ex.: Piscina Municipal"
                  />
                </div>

                <div>
                  <Label>Escalões * (selecione pelo menos um)</Label>
                  <div className="border rounded-md p-3 mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {(escaloes || []).map((escalao) => (
                      <div key={escalao.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`escalao-${escalao.id}`}
                          checked={formData.escaloes.includes(escalao.id)}
                          onCheckedChange={() => handleEscalaoToggle(escalao.id)}
                        />
                        <label
                          htmlFor={`escalao-${escalao.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {escalao.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  {formData.escaloes.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Selecione pelo menos um escalão</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="volume_planeado_m">Nº Total de Metros</Label>
                  <Input
                    id="volume_planeado_m"
                    type="number"
                    min="0"
                    value={formData.volume_planeado_m}
                    onChange={(e) => setFormData({ ...formData, volume_planeado_m: e.target.value })}
                    placeholder="Ex.: 3000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Volume total planeado em metros
                  </p>
                </div>

                <div>
                  <Label htmlFor="descricao_treino">Descrição</Label>
                  <Textarea
                    id="descricao_treino"
                    value={formData.descricao_treino}
                    onChange={(e) => setFormData({ ...formData, descricao_treino: e.target.value })}
                    placeholder="Descreva o treino, séries, objetivos..."
                    rows={8}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use este campo para detalhar as séries e exercícios do treino
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveTreino}>
                  {isEditMode ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {sortedTreinos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <SwimmingPool size={36} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">Nenhum treino registado</p>
            <p className="text-xs mt-1">Crie um treino para começar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTreinos.map((treino) => {
              const isExpanded = expandedTreinos.has(treino.id);
              const escaloesNomes = (treino.escaloes || [])
                .map(id => (escaloes || []).find(e => e.id === id)?.name)
                .filter(Boolean)
                .join(', ');

              return (
                <Card key={treino.id} className="overflow-hidden">
                  <div className="p-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpanded(treino.id)}
                          className="h-6 w-6 p-0"
                        >
                          {isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
                        </Button>
                        
                        <div className="flex items-center gap-3 flex-1">
                          <span className="font-semibold text-sm">#{treino.numero_treino}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(treino.data), 'dd/MM/yyyy')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {treino.hora_inicio}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                            {treino.tipo_treino}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {escaloesNomes}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {treino.evento_id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onNavigate?.('events', { tab: 'eventos', eventId: treino.evento_id })}
                            title="Ver no calendário"
                          >
                            <CalendarBlank size={16} />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditTreino(treino)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicateTreino(treino)}
                          title="Duplicar treino"
                        >
                          <Copy size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTreino(treino)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 space-y-3 border-t">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Local:</span>{' '}
                          <span className="font-medium">{treino.local}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Horário:</span>{' '}
                          <span className="font-medium">
                            {treino.hora_inicio} {treino.hora_fim && `- ${treino.hora_fim}`}
                          </span>
                        </div>
                        {treino.volume_planeado_m && (
                          <div>
                            <span className="text-muted-foreground">Volume:</span>{' '}
                            <span className="font-medium">{treino.volume_planeado_m}m</span>
                          </div>
                        )}
                      </div>

                      {treino.descricao_treino && (
                        <div>
                          <p className="text-xs font-semibold mb-1">Descrição do Treino:</p>
                          <pre className="text-xs bg-muted p-3 rounded whitespace-pre-wrap font-mono">
                            {treino.descricao_treino}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-4 bg-blue-50/50 border-blue-200">
        <h4 className="text-xs font-semibold mb-2">Sobre os Treinos</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Ao criar um treino, é automaticamente criado um evento no calendário</p>
          <p>• Use o campo de descrição para detalhar as séries e objetivos do treino</p>
          <p>• Pode duplicar treinos para reutilizar a mesma estrutura</p>
          <p>• Os treinos aparecem organizados por data (mais recentes primeiro)</p>
        </div>
      </Card>
    </div>
  );
}
