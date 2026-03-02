import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/Components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import {
  Plus,
  MagnifyingGlass,
  CalendarBlank,
  Pencil,
  Trash,
  MapPin,
  Clock,
  Users,
  CheckSquare,
} from '@phosphor-icons/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Event {
  id: string;
  titulo: string;
  data_inicio: string;
  hora_inicio?: string;
  local: string;
  tipo: string;
  estado: string;
  criado_por?: string;
  escaloes_elegiveis?: string[];
  descricao?: string;
  centro_custo_id?: string;
}

interface CostCenter {
  id: string;
  nome: string;
  codigo?: string;
  ativo?: boolean;
}

interface AgeGroup {
  id: string;
  nome: string;
  idade_minima?: number;
  idade_maxima?: number;
  ativo?: boolean;
}

interface EventosListProps {
  events: Event[];
  users?: any[];
  costCenters?: CostCenter[];
  ageGroups?: AgeGroup[];
}

const daysOfWeek = [
  { id: 'segunda', label: 'Segunda', value: '1' },
  { id: 'terca', label: 'Terça', value: '2' },
  { id: 'quarta', label: 'Quarta', value: '3' },
  { id: 'quinta', label: 'Quinta', value: '4' },
  { id: 'sexta', label: 'Sexta', value: '5' },
  { id: 'sabado', label: 'Sábado', value: '6' },
  { id: 'domingo', label: 'Domingo', value: '0' },
];

export function EventosList({
  events = [],
  users = [],
  costCenters = [],
  ageGroups = [],
}: EventosListProps) {
  const resolveEscalaoIds = (escaloes: string[]) => {
    if (!Array.isArray(escaloes)) return [] as string[];
    const byId = new Map(ageGroups.map((group) => [group.id, group.id]));
    const byName = new Map(ageGroups.map((group) => [group.nome.toLowerCase(), group.id]));
    return escaloes
      .map((value) => byId.get(value) || byName.get(value.toLowerCase()) || value)
      .filter(Boolean);
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    hora_inicio: '',
    data_fim: '',
    hora_fim: '',
    local: '',
    local_detalhes: '',
    tipo: 'evento_interno',
    tipo_piscina: '',
    visibilidade: 'publico',
    escaloes_elegiveis: [] as string[],
    transporte_necessario: false,
    transporte_detalhes: '',
    hora_partida: '',
    local_partida: '',
    taxa_inscricao: '',
    custo_inscricao_por_prova: '',
    custo_inscricao_por_salto: '',
    custo_inscricao_estafeta: '',
    centro_custo_id: '',
    observacoes: '',
    estado: 'agendado',
    recorrente: false,
    recorrencia_data_inicio: '',
    recorrencia_data_fim: '',
    recorrencia_dias_semana: [] as string[],
  });

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        const matchesSearch =
          event.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.descricao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.local || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'todos' || event.tipo === typeFilter;
        const matchesStatus = statusFilter === 'todos' || event.estado === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime());
  }, [events, searchTerm, typeFilter, statusFilter]);

  const handleSave = async () => {
    if (!formData.titulo.trim()) {
      toast.error('Preencha o título do evento');
      return;
    }

    if (!formData.data_inicio) {
      toast.error('Preencha a data do evento');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        recorrencia_dias_semana: formData.recorrente ? formData.recorrencia_dias_semana : [],
      };

      if (editingEvent) {
        router.put(`/eventos/${editingEvent.id}`, payload, {
          onSuccess: () => {
            toast.success('Evento atualizado com sucesso!');
            setDialogOpen(false);
            resetForm();
          },
          onError: (err: any) => {
            toast.error('Erro ao atualizar evento');
            console.error(err);
          },
        });
      } else {
        router.post('/eventos', payload, {
          onSuccess: () => {
            toast.success('Evento criado com sucesso!');
            setDialogOpen(false);
            resetForm();
          },
          onError: (err: any) => {
            toast.error('Erro ao criar evento');
            console.error(err);
          },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este evento?')) {
      router.delete(`/eventos/${id}`, {
        onSuccess: () => {
          toast.success('Evento eliminado com sucesso!');
        },
        onError: () => {
          toast.error('Erro ao eliminar evento');
        },
      });
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      data_inicio: '',
      hora_inicio: '',
      data_fim: '',
      hora_fim: '',
      local: '',
      local_detalhes: '',
      tipo: 'evento_interno',
      tipo_piscina: '',
      visibilidade: 'publico',
      escaloes_elegiveis: [],
      transporte_necessario: false,
      transporte_detalhes: '',
      hora_partida: '',
      local_partida: '',
      taxa_inscricao: '',
      custo_inscricao_por_prova: '',
      custo_inscricao_por_salto: '',
      custo_inscricao_estafeta: '',
      centro_custo_id: '',
      observacoes: '',
      estado: 'agendado',
      recorrente: false,
      recorrencia_data_inicio: '',
      recorrencia_data_fim: '',
      recorrencia_dias_semana: [],
    });
    setEditingEvent(null);
  };

  const toggleEventSelection = (eventId: string) => {
    const newSelection = new Set(selectedEvents);
    if (newSelection.has(eventId)) {
      newSelection.delete(eventId);
    } else {
      newSelection.add(eventId);
    }
    setSelectedEvents(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedEvents.size === filteredEvents.length && filteredEvents.length > 0) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(filteredEvents.map((e) => e.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEvents.size === 0) return;

    setIsBulkDeleting(true);
    try {
      const promises = Array.from(selectedEvents).map((id) =>
        router.delete(`/eventos/${id}`, {
          preserveState: true,
          preserveScroll: true,
          only: ['events'],
        })
      );

      await Promise.all(promises);
      toast.success(`${selectedEvents.size} evento(s) eliminado(s) com sucesso!`);
      setSelectedEvents(new Set());
      setIsBulkDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Erro ao eliminar eventos:', error);
      toast.error('Erro ao eliminar eventos');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const getEventTypeClass = (tipo: string) => {
    switch (tipo) {
      case 'prova':
        return 'bg-red-100 text-red-700';
      case 'treino':
        return 'bg-green-100 text-green-700';
      case 'estagio':
      case 'competicao':
        return 'bg-blue-100 text-blue-700';
      case 'evento_interno':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEventTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'prova':
        return 'Prova';
      case 'treino':
        return 'Treino';
      case 'estagio':
        return 'Estágio';
      case 'reuniao':
        return 'Reunião';
      case 'evento_interno':
        return 'Evento Interno';
      case 'competicao':
        return 'Competição';
      default:
        return 'Outro';
    }
  };

  const getEventStatusClass = (estado: string) => {
    switch (estado) {
      case 'agendado':
        return 'bg-green-100 text-green-700';
      case 'em_curso':
        return 'bg-blue-100 text-blue-700';
      case 'concluido':
        return 'bg-slate-100 text-slate-700';
      case 'cancelado':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEventStatusLabel = (estado: string) => {
    switch (estado) {
      case 'agendado':
        return 'Agendado';
      case 'em_curso':
        return 'Em Curso';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      case 'rascunho':
        return 'Rascunho';
      default:
        return estado;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredEvents.length} de {events.length} eventos
        </div>

        <div className="flex gap-2">
          {selectedEvents.size > 0 && (
            <Button
              variant="destructive"
              onClick={() => setIsBulkDeleteDialogOpen(true)}
              className="h-8 text-xs"
            >
              <Trash size={14} className="mr-1.5" />
              Eliminar ({selectedEvents.size})
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="h-8 text-xs">
                <Plus size={14} className="mr-1.5" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Editar Evento' : 'Novo Evento'}
              </DialogTitle>
              <DialogDescription>
                {editingEvent
                  ? 'Atualize os detalhes do evento'
                  : 'Crie um novo evento desportivo ou atividade do clube'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Informações Básicas</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) =>
                      setFormData({ ...formData, titulo: e.target.value })
                    }
                    placeholder="Nome do evento"
                    className="bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          tipo: value,
                          tipo_piscina: value === 'prova' ? formData.tipo_piscina : '',
                        })
                      }
                    >
                      <SelectTrigger id="tipo" className="bg-white">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="treino">Treino</SelectItem>
                        <SelectItem value="prova">Prova</SelectItem>
                        <SelectItem value="competicao">Competição</SelectItem>
                        <SelectItem value="evento_interno">Evento Interno</SelectItem>
                        <SelectItem value="reuniao">Reunião</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="centro_custo_id">Centro de Custo</Label>
                    <Select
                      value={formData.centro_custo_id || 'none'}
                      onValueChange={(value) =>
                        setFormData({ ...formData, centro_custo_id: value === 'none' ? '' : value })
                      }
                    >
                      <SelectTrigger id="centro_custo_id" className="bg-white">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {(costCenters || [])
                          .filter((cc) => cc.ativo !== false)
                          .map((cc) => (
                            <SelectItem key={cc.id} value={cc.id}>
                              {cc.codigo ? `${cc.codigo} - ${cc.nome}` : cc.nome}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    placeholder="Detalhes do evento"
                    rows={3}
                    className="bg-white"
                  />
                </div>
              </div>

              {/* Data e Hora */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Data e Hora</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_inicio">Data Início *</Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) =>
                        setFormData({ ...formData, data_inicio: e.target.value })
                      }
                      placeholder="dd/mm/aaaa"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora_inicio">Hora Início</Label>
                    <Input
                      id="hora_inicio"
                      type="time"
                      value={formData.hora_inicio}
                      onChange={(e) =>
                        setFormData({ ...formData, hora_inicio: e.target.value })
                      }
                      placeholder="--:--"
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_fim">Data Fim</Label>
                    <Input
                      id="data_fim"
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) =>
                        setFormData({ ...formData, data_fim: e.target.value })
                      }
                      placeholder="dd/mm/aaaa"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora_fim">Hora Fim</Label>
                    <Input
                      id="hora_fim"
                      type="time"
                      value={formData.hora_fim}
                      onChange={(e) =>
                        setFormData({ ...formData, hora_fim: e.target.value })
                      }
                      placeholder="--:--"
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Local */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Local</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="local">Local</Label>
                    <Input
                      id="local"
                      value={formData.local}
                      onChange={(e) =>
                        setFormData({ ...formData, local: e.target.value })
                      }
                      placeholder="Nome do local"
                      className="bg-white"
                    />
                  </div>

                  {formData.tipo === 'prova' && (
                    <div className="space-y-2">
                      <Label htmlFor="tipo_piscina">Tipo de Piscina</Label>
                      <Select
                        value={formData.tipo_piscina}
                        onValueChange={(value) =>
                          setFormData({ ...formData, tipo_piscina: value })
                        }
                      >
                        <SelectTrigger id="tipo_piscina" className="bg-white">
                          <SelectValue placeholder="Selecionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="piscina_25m">Piscina de 25m</SelectItem>
                          <SelectItem value="piscina_50m">Piscina de 50m</SelectItem>
                          <SelectItem value="aguas_abertas">Águas Abertas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="local_detalhes">Morada / Detalhes Local</Label>
                  <Textarea
                    id="local_detalhes"
                    value={formData.local_detalhes}
                    onChange={(e) =>
                      setFormData({ ...formData, local_detalhes: e.target.value })
                    }
                    placeholder="Morada completa"
                    rows={2}
                    className="bg-white"
                  />
                </div>
              </div>

              {/* Escalões Elegíveis */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Escalões Elegíveis</h3>
                
                {ageGroups.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Nenhum escalão configurado. Configure em Configurações → Escalões.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {ageGroups
                      .filter((group) => group.ativo !== false)
                      .map((escalao) => (
                        <div key={escalao.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`escalao-${escalao.id}`}
                            checked={
                              formData.escaloes_elegiveis.includes(escalao.id) ||
                              formData.escaloes_elegiveis.includes(escalao.nome)
                            }
                            onCheckedChange={(checked) => {
                              const updated = resolveEscalaoIds([...formData.escaloes_elegiveis]);
                              const current = updated.includes(escalao.id);
                              if (checked && !current) {
                                updated.push(escalao.id);
                              }
                              if (!checked && current) {
                                updated.splice(updated.indexOf(escalao.id), 1);
                              }
                              setFormData({
                                ...formData,
                                escaloes_elegiveis: updated,
                              });
                            }}
                          />
                          <Label
                            htmlFor={`escalao-${escalao.id}`}
                            className="cursor-pointer text-sm"
                          >
                            {escalao.nome}
                          </Label>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Transporte */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Transporte</h3>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="transporte_necessario"
                    checked={formData.transporte_necessario}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, transporte_necessario: checked as boolean })
                    }
                  />
                  <Label htmlFor="transporte_necessario" className="cursor-pointer">
                    Transporte Necessário
                  </Label>
                </div>

                {formData.transporte_necessario && (
                  <div className="space-y-4 bg-slate-50 p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hora_partida">Hora de Partida</Label>
                        <Input
                          id="hora_partida"
                          type="time"
                          value={formData.hora_partida}
                          onChange={(e) =>
                            setFormData({ ...formData, hora_partida: e.target.value })
                          }
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="local_partida">Local de Partida</Label>
                        <Input
                          id="local_partida"
                          value={formData.local_partida}
                          onChange={(e) =>
                            setFormData({ ...formData, local_partida: e.target.value })
                          }
                          placeholder="Ponto de encontro"
                          className="bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transporte_detalhes">Detalhes do Transporte</Label>
                      <Textarea
                        id="transporte_detalhes"
                        value={formData.transporte_detalhes}
                        onChange={(e) =>
                          setFormData({ ...formData, transporte_detalhes: e.target.value })
                        }
                        placeholder="Informações adicionais sobre o transporte"
                        className="bg-white"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Custos (apenas para provas/competições) */}
              {(formData.tipo === 'prova' || formData.tipo === 'competicao') && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold border-b pb-2">Custos de Inscrição</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxa_inscricao">Taxa de Inscrição (€)</Label>
                      <Input
                        id="taxa_inscricao"
                        type="number"
                        step="0.01"
                        value={formData.taxa_inscricao}
                        onChange={(e) =>
                          setFormData({ ...formData, taxa_inscricao: e.target.value })
                        }
                        placeholder="0.00"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custo_inscricao_por_prova">Custo por Prova (€)</Label>
                      <Input
                        id="custo_inscricao_por_prova"
                        type="number"
                        step="0.01"
                        value={formData.custo_inscricao_por_prova}
                        onChange={(e) =>
                          setFormData({ ...formData, custo_inscricao_por_prova: e.target.value })
                        }
                        placeholder="0.00"
                        className="bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="custo_inscricao_por_salto">Custo por Salto (€)</Label>
                      <Input
                        id="custo_inscricao_por_salto"
                        type="number"
                        step="0.01"
                        value={formData.custo_inscricao_por_salto}
                        onChange={(e) =>
                          setFormData({ ...formData, custo_inscricao_por_salto: e.target.value })
                        }
                        placeholder="0.00"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custo_inscricao_estafeta">Custo Estafeta (€)</Label>
                      <Input
                        id="custo_inscricao_estafeta"
                        type="number"
                        step="0.01"
                        value={formData.custo_inscricao_estafeta}
                        onChange={(e) =>
                          setFormData({ ...formData, custo_inscricao_estafeta: e.target.value })
                        }
                        placeholder="0.00"
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Observações e Estado */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                    placeholder="Notas adicionais"
                    rows={3}
                    className="bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="visibilidade">Visibilidade</Label>
                    <Select
                      value={formData.visibilidade}
                      onValueChange={(value) =>
                        setFormData({ ...formData, visibilidade: value })
                      }
                    >
                      <SelectTrigger id="visibilidade" className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="publico">Público</SelectItem>
                        <SelectItem value="privado">Privado</SelectItem>
                        <SelectItem value="interno">Interno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(value) =>
                        setFormData({ ...formData, estado: value })
                      }
                    >
                      <SelectTrigger id="estado" className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="agendado">Agendado</SelectItem>
                        <SelectItem value="em_curso">Em Curso</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Recorrência */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="recorrente"
                    checked={formData.recorrente}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, recorrente: checked as boolean })
                    }
                  />
                  <Label htmlFor="recorrente" className="cursor-pointer font-semibold">
                    Evento Recorrente
                  </Label>
                </div>

                {formData.recorrente && (
                  <div className="space-y-4 bg-slate-50 p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="recorrencia_data_inicio">
                          Data Início Recorrência *
                        </Label>
                        <Input
                          id="recorrencia_data_inicio"
                          type="date"
                          value={formData.recorrencia_data_inicio}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recorrencia_data_inicio: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recorrencia_data_fim">
                          Data Fim Recorrência *
                        </Label>
                        <Input
                          id="recorrencia_data_fim"
                          type="date"
                          value={formData.recorrencia_data_fim}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recorrencia_data_fim: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Dias da Semana *</Label>
                      <div className="grid grid-cols-4 gap-3">
                        {daysOfWeek.map((day) => (
                          <div key={day.id} className="flex items-center gap-2">
                            <Checkbox
                              id={day.id}
                              checked={formData.recorrencia_dias_semana.includes(
                                day.value
                              )}
                              onCheckedChange={(checked) => {
                                const updated = [...formData.recorrencia_dias_semana];
                                if (checked) {
                                  updated.push(day.value);
                                } else {
                                  const index = updated.indexOf(day.value);
                                  if (index > -1) {
                                    updated.splice(index, 1);
                                  }
                                }
                                setFormData({
                                  ...formData,
                                  recorrencia_dias_semana: updated,
                                });
                              }}
                            />
                            <Label
                              htmlFor={day.id}
                              className="cursor-pointer text-sm"
                            >
                              {day.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? 'A guardar...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      <Card className="p-2.5">
        <div className="space-y-2">
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                placeholder="Pesquisar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-7 pl-8 text-xs bg-white"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-7 w-full md:w-[170px] text-xs bg-white">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="prova">Prova</SelectItem>
                <SelectItem value="treino">Treino</SelectItem>
                <SelectItem value="estagio">Estágio</SelectItem>
                <SelectItem value="evento_interno">Evento Interno</SelectItem>
                <SelectItem value="reuniao">Reunião</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-7 w-full md:w-[170px] text-xs bg-white">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Estados</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="em_curso">Em Curso</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredEvents.length > 0 && (
            <div className="flex items-center gap-2 border-t pt-1.5">
              <Button variant="outline" onClick={toggleSelectAll} className="h-7 text-xs">
                <CheckSquare size={14} className="mr-1.5" />
                {selectedEvents.size === filteredEvents.length ? 'Desselecionar Todos' : 'Selecionar Todos'}
              </Button>
              <span className="text-xs text-muted-foreground">
                Selecione eventos para eliminar múltiplos de uma vez
              </span>
            </div>
          )}
        </div>
      </Card>

      {filteredEvents.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <CalendarBlank className="mx-auto mb-2 text-muted-foreground" size={34} weight="thin" />
            <h3 className="text-sm font-semibold">Nenhum evento encontrado</h3>
            <p className="text-xs text-muted-foreground">Crie o seu primeiro evento para começar.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className={`relative p-2 transition-all hover:shadow-sm ${
                selectedEvents.has(event.id) ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="absolute left-2 top-2">
                <Checkbox
                  checked={selectedEvents.has(event.id)}
                  onCheckedChange={() => toggleEventSelection(event.id)}
                  aria-label={`Selecionar ${event.titulo}`}
                />
              </div>

              <div className="space-y-1 pl-6">
                <div className="flex items-start justify-between gap-1.5">
                  <h3 className="line-clamp-2 text-[13px] font-semibold leading-4">{event.titulo}</h3>
                  <Badge className={`${getEventTypeClass(event.tipo)} text-xs`}>{getEventTypeLabel(event.tipo)}</Badge>
                </div>

                {event.descricao && <p className="line-clamp-1 text-[11px] text-muted-foreground">{event.descricao}</p>}

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <CalendarBlank size={11} />
                  <span>
                    {format(new Date(event.data_inicio), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    {event.hora_inicio && ` às ${event.hora_inicio}`}
                  </span>
                </div>

                {event.local && (
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin size={11} />
                    <span className="truncate">{event.local}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  <Badge className={`${getEventStatusClass(event.estado)} text-xs`}>{getEventStatusLabel(event.estado)}</Badge>
                  {event.escaloes_elegiveis && event.escaloes_elegiveis.length > 0 && (
                    <Badge variant="outline" className="text-[11px]">
                      <Users size={11} className="mr-1" />
                      {event.escaloes_elegiveis.length} escalão
                      {event.escaloes_elegiveis.length > 1 ? 'ões' : ''}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-end gap-0.5 pt-0.5">
                  <Button
                    variant="ghost"
                    className="h-5 px-1"
                    onClick={() => {
                      setEditingEvent(event);
                      setFormData({
                        titulo: event.titulo,
                        descricao: event.descricao || '',
                        data_inicio: event.data_inicio,
                        hora_inicio: event.hora_inicio || '',
                        data_fim: (event as any).data_fim || '',
                        hora_fim: (event as any).hora_fim || '',
                        local: event.local,
                        local_detalhes: (event as any).local_detalhes || '',
                        tipo: event.tipo,
                        tipo_piscina: (event as any).tipo_piscina || '',
                        visibilidade: (event as any).visibilidade || 'publico',
                        escaloes_elegiveis: resolveEscalaoIds(event.escaloes_elegiveis || []),
                        transporte_necessario: (event as any).transporte_necessario || false,
                        transporte_detalhes: (event as any).transporte_detalhes || '',
                        hora_partida: (event as any).hora_partida || '',
                        local_partida: (event as any).local_partida || '',
                        taxa_inscricao: (event as any).taxa_inscricao || '',
                        custo_inscricao_por_prova: (event as any).custo_inscricao_por_prova || '',
                        custo_inscricao_por_salto: (event as any).custo_inscricao_por_salto || '',
                        custo_inscricao_estafeta: (event as any).custo_inscricao_estafeta || '',
                        centro_custo_id: (event as any).centro_custo_id || '',
                        observacoes: (event as any).observacoes || '',
                        estado: event.estado,
                        recorrente: (event as any).recorrente || false,
                        recorrencia_data_inicio: (event as any).recorrencia_data_inicio || '',
                        recorrencia_data_fim: (event as any).recorrencia_data_fim || '',
                        recorrencia_dias_semana: (event as any).recorrencia_dias_semana || [],
                      });
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-5 px-1"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash size={12} className="text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* AlertDialog - Confirmação de Eliminação em Massa */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminação em Massa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar <strong>{selectedEvents.size}</strong>{' '}
              evento(s) selecionado(s)? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBulkDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
