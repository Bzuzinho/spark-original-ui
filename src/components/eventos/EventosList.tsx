import { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Event, User, CentroCusto, EventoTipo, EventoPresenca } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, MagnifyingGlass, CalendarBlank, MapPin, Users, Car, CurrencyEur, Pencil, Trash, Repeat, CheckSquare, Square } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AgeGroup {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
}

export function EventosList() {
  const [events, setEvents] = useKV<Event[]>('club-events', []);
  const [users] = useKV<User[]>('club-users', []);
  const [presencas, setPresencas] = useKV<EventoPresenca[]>('club-presencas', []);
  const [centrosCusto] = useKV<CentroCusto[]>('club-centros-custo', []);
  const [ageGroups] = useKV<AgeGroup[]>('settings-age-groups', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    hora_inicio: '',
    data_fim: '',
    hora_fim: '',
    local: '',
    local_detalhes: '',
    tipo: 'evento_interno' as EventoTipo,
    tipo_piscina: '' as 'piscina_25m' | 'piscina_50m' | 'aguas_abertas' | '',
    escaloes_elegiveis: [] as string[],
    transporte_necessario: false,
    transporte_detalhes: '',
    hora_partida: '',
    local_partida: '',
    custo_inscricao_por_prova: 0,
    custo_inscricao_por_salto: 0,
    custo_inscricao_estafeta: 0,
    centro_custo_id: '',
    observacoes: '',
    recorrente: false,
    recorrencia_data_inicio: '',
    recorrencia_data_fim: '',
    recorrencia_dias_semana: [] as number[],
  });

  const escaloesList = useMemo(() => {
    return (ageGroups || []);
  }, [ageGroups]);

  const calculateEventStatus = (dataInicio: string, horaInicio: string | undefined, dataFim: string | undefined, horaFim: string | undefined): Event['estado'] => {
    const now = new Date();

    const eventStartDateTime = new Date(dataInicio);
    if (horaInicio) {
      const [hours, minutes] = horaInicio.split(':');
      eventStartDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    } else {
      eventStartDateTime.setHours(0, 0, 0, 0);
    }

    let eventEndDateTime: Date;
    if (dataFim) {
      eventEndDateTime = new Date(dataFim);
      if (horaFim) {
        const [hours, minutes] = horaFim.split(':');
        eventEndDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      } else {
        eventEndDateTime.setHours(23, 59, 59, 999);
      }
    } else {
      eventEndDateTime = new Date(eventStartDateTime);
      if (horaFim) {
        const [hours, minutes] = horaFim.split(':');
        eventEndDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      } else {
        eventEndDateTime.setHours(23, 59, 59, 999);
      }
    }

    if (now > eventEndDateTime) {
      return 'concluido';
    }

    if (now >= eventStartDateTime && now <= eventEndDateTime) {
      return 'em_curso';
    }

    return 'agendado';
  };

  const createAttendanceRecords = (event: Event) => {
    if (event.tipo === 'treino') {
      const existingPresencas = (presencas || []).filter(p => p.evento_id === event.id);
      
      if (existingPresencas.length === 0) {
        toast.success(`Registo de presenças criado para o treino "${event.titulo}". Pode adicionar atletas na tab Presenças.`);
      }
      
      return;
    }

    if (!event.escaloes_elegiveis || event.escaloes_elegiveis.length === 0) {
      return;
    }

    const eligibleUsers = (users || []).filter(user => {
      if (user.estado !== 'ativo') return false;
      if (!user.escalao || user.escalao.length === 0) return false;
      
      return user.escalao.some(userEscalao => 
        event.escaloes_elegiveis?.includes(userEscalao)
      );
    });

    if (eligibleUsers.length === 0) {
      return;
    }

    const newPresencas: EventoPresenca[] = eligibleUsers.map(user => ({
      id: crypto.randomUUID(),
      evento_id: event.id,
      user_id: user.id,
      estado: 'ausente',
      registado_por: 'sistema',
      registado_em: new Date().toISOString(),
    }));

    setPresencas(current => [...(current || []), ...newPresencas]);
    
    toast.success(`Registo de presenças criado com ${eligibleUsers.length} atleta${eligibleUsers.length > 1 ? 's' : ''}!`);
  };

  const generateRecurringEvents = (baseEvent: Event, startDate: string, endDate: string, diasSemana: number[]): Event[] => {
    const events: Event[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      
      if (diasSemana.includes(dayOfWeek)) {
        const eventDate = current.toISOString().split('T')[0];
        
        const eventStatus = calculateEventStatus(
          eventDate,
          baseEvent.hora_inicio,
          baseEvent.data_fim,
          baseEvent.hora_fim
        );
        
        const newEvent: Event = {
          ...baseEvent,
          id: crypto.randomUUID(),
          data_inicio: eventDate,
          estado: eventStatus,
          evento_pai_id: baseEvent.id,
          criado_em: new Date().toISOString(),
        };
        
        events.push(newEvent);
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return events;
  };

  const filteredEvents = useMemo(() => {
    return (events || []).filter(event => {
      const matchesSearch = 
        event.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.local?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'todos' || event.tipo === typeFilter;
      const matchesStatus = statusFilter === 'todos' || event.estado === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime());
  }, [events, searchTerm, typeFilter, statusFilter]);

  const handleCreateEvent = () => {
    if (!formData.titulo.trim() || !formData.data_inicio) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (formData.recorrente) {
      if (!formData.recorrencia_data_inicio || !formData.recorrencia_data_fim) {
        toast.error('Preencha as datas de início e fim da recorrência');
        return;
      }
      
      if (formData.recorrencia_dias_semana.length === 0) {
        toast.error('Selecione pelo menos um dia da semana para recorrência');
        return;
      }
    }

    const baseEvent: Event = {
      id: crypto.randomUUID(),
      titulo: formData.titulo,
      descricao: formData.descricao,
      data_inicio: formData.data_inicio,
      hora_inicio: formData.hora_inicio || undefined,
      data_fim: formData.data_fim || undefined,
      hora_fim: formData.hora_fim || undefined,
      local: formData.local || undefined,
      local_detalhes: formData.local_detalhes || undefined,
      tipo: formData.tipo,
      tipo_piscina: formData.tipo === 'prova' && formData.tipo_piscina ? formData.tipo_piscina : undefined,
      escaloes_elegiveis: formData.escaloes_elegiveis.length > 0 ? formData.escaloes_elegiveis : undefined,
      transporte_necessario: formData.transporte_necessario,
      transporte_detalhes: formData.transporte_necessario ? formData.transporte_detalhes : undefined,
      hora_partida: formData.transporte_necessario ? formData.hora_partida : undefined,
      local_partida: formData.transporte_necessario ? formData.local_partida : undefined,
      custo_inscricao_por_prova: formData.tipo === 'prova' && formData.custo_inscricao_por_prova > 0 ? formData.custo_inscricao_por_prova : undefined,
      custo_inscricao_por_salto: formData.tipo === 'prova' && formData.custo_inscricao_por_salto > 0 ? formData.custo_inscricao_por_salto : undefined,
      custo_inscricao_estafeta: formData.tipo === 'prova' && formData.custo_inscricao_estafeta > 0 ? formData.custo_inscricao_estafeta : undefined,
      centro_custo_id: formData.centro_custo_id || undefined,
      observacoes: formData.observacoes || undefined,
      estado: calculateEventStatus(
        formData.data_inicio, 
        formData.hora_inicio || undefined, 
        formData.data_fim || undefined, 
        formData.hora_fim || undefined
      ),
      criado_por: 'admin',
      criado_em: new Date().toISOString(),
      recorrente: formData.recorrente,
      recorrencia_data_inicio: formData.recorrente ? formData.recorrencia_data_inicio : undefined,
      recorrencia_data_fim: formData.recorrente ? formData.recorrencia_data_fim : undefined,
      recorrencia_dias_semana: formData.recorrente ? formData.recorrencia_dias_semana : undefined,
    };

    if (formData.recorrente && formData.recorrencia_data_inicio && formData.recorrencia_data_fim) {
      const recurringEvents = generateRecurringEvents(
        baseEvent,
        formData.recorrencia_data_inicio,
        formData.recorrencia_data_fim,
        formData.recorrencia_dias_semana
      );
      
      setEvents(current => [...(current || []), baseEvent, ...recurringEvents]);
      
      createAttendanceRecords(baseEvent);
      recurringEvents.forEach(event => createAttendanceRecords(event));
      
      toast.success(`Evento recorrente criado! ${recurringEvents.length} eventos gerados.`);
    } else {
      setEvents(current => [...(current || []), baseEvent]);
      
      createAttendanceRecords(baseEvent);
      
      toast.success('Evento criado com sucesso!');
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleUpdateEvent = () => {
    if (!editingEvent) return;

    setEvents(current => 
      (current || []).map(e => 
        e.id === editingEvent.id 
          ? { 
              ...e,
              titulo: formData.titulo,
              descricao: formData.descricao,
              data_inicio: formData.data_inicio,
              hora_inicio: formData.hora_inicio || undefined,
              data_fim: formData.data_fim || undefined,
              hora_fim: formData.hora_fim || undefined,
              local: formData.local || undefined,
              local_detalhes: formData.local_detalhes || undefined,
              tipo: formData.tipo,
              tipo_piscina: formData.tipo === 'prova' && formData.tipo_piscina ? formData.tipo_piscina : undefined,
              escaloes_elegiveis: formData.escaloes_elegiveis.length > 0 ? formData.escaloes_elegiveis : undefined,
              transporte_necessario: formData.transporte_necessario,
              transporte_detalhes: formData.transporte_necessario ? formData.transporte_detalhes : undefined,
              hora_partida: formData.transporte_necessario ? formData.hora_partida : undefined,
              local_partida: formData.transporte_necessario ? formData.local_partida : undefined,
              custo_inscricao_por_prova: formData.tipo === 'prova' && formData.custo_inscricao_por_prova > 0 ? formData.custo_inscricao_por_prova : undefined,
              custo_inscricao_por_salto: formData.tipo === 'prova' && formData.custo_inscricao_por_salto > 0 ? formData.custo_inscricao_por_salto : undefined,
              custo_inscricao_estafeta: formData.tipo === 'prova' && formData.custo_inscricao_estafeta > 0 ? formData.custo_inscricao_estafeta : undefined,
              centro_custo_id: formData.centro_custo_id || undefined,
              observacoes: formData.observacoes || undefined,
              atualizado_em: new Date().toISOString(),
              recorrente: formData.recorrente,
              recorrencia_data_inicio: formData.recorrente ? formData.recorrencia_data_inicio : undefined,
              recorrencia_data_fim: formData.recorrente ? formData.recorrencia_data_fim : undefined,
              recorrencia_dias_semana: formData.recorrente ? formData.recorrencia_dias_semana : undefined,
            }
          : e
      )
    );
    toast.success('Evento atualizado com sucesso!');
    setEditingEvent(null);
    setDialogOpen(false);
    resetForm();
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Tem certeza que deseja eliminar este evento?')) {
      setEvents(current => (current || []).filter(e => e.id !== eventId));
      toast.success('Evento eliminado com sucesso!');
      setDetailsDialogOpen(false);
    }
  };

  const handleDeleteMultipleEvents = () => {
    if (selectedEventIds.length === 0) return;
    
    setDeleteDialogOpen(true);
  };

  const confirmDeleteMultiple = () => {
    setEvents(current => (current || []).filter(e => !selectedEventIds.includes(e.id)));
    toast.success(`${selectedEventIds.length} evento${selectedEventIds.length > 1 ? 's eliminados' : ' eliminado'} com sucesso!`);
    setSelectedEventIds([]);
    setDeleteDialogOpen(false);
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEventIds(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEventIds.length === filteredEvents.length) {
      setSelectedEventIds([]);
    } else {
      setSelectedEventIds(filteredEvents.map(e => e.id));
    }
  };

  const isAllSelected = filteredEvents.length > 0 && selectedEventIds.length === filteredEvents.length;

  const handleChangeStatus = (eventId: string, newStatus: Event['estado']) => {
    setEvents(current =>
      (current || []).map(e =>
        e.id === eventId ? { ...e, estado: newStatus, atualizado_em: new Date().toISOString() } : e
      )
    );
    toast.success(`Estado alterado para ${newStatus}`);
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
      escaloes_elegiveis: [],
      transporte_necessario: false,
      transporte_detalhes: '',
      hora_partida: '',
      local_partida: '',
      custo_inscricao_por_prova: 0,
      custo_inscricao_por_salto: 0,
      custo_inscricao_estafeta: 0,
      centro_custo_id: '',
      observacoes: '',
      recorrente: false,
      recorrencia_data_inicio: '',
      recorrencia_data_fim: '',
      recorrencia_dias_semana: [],
    });
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      titulo: event.titulo,
      descricao: event.descricao,
      data_inicio: event.data_inicio,
      hora_inicio: event.hora_inicio || '',
      data_fim: event.data_fim || '',
      hora_fim: event.hora_fim || '',
      local: event.local || '',
      local_detalhes: event.local_detalhes || '',
      tipo: event.tipo,
      tipo_piscina: event.tipo_piscina || '',
      escaloes_elegiveis: event.escaloes_elegiveis || [],
      transporte_necessario: event.transporte_necessario || false,
      transporte_detalhes: event.transporte_detalhes || '',
      hora_partida: event.hora_partida || '',
      local_partida: event.local_partida || '',
      custo_inscricao_por_prova: event.custo_inscricao_por_prova || 0,
      custo_inscricao_por_salto: event.custo_inscricao_por_salto || 0,
      custo_inscricao_estafeta: event.custo_inscricao_estafeta || 0,
      centro_custo_id: event.centro_custo_id || '',
      observacoes: event.observacoes || '',
      recorrente: event.recorrente || false,
      recorrencia_data_inicio: event.recorrencia_data_inicio || '',
      recorrencia_data_fim: event.recorrencia_data_fim || '',
      recorrencia_dias_semana: event.recorrencia_dias_semana || [],
    });
    setDialogOpen(true);
  };

  const openDetailsDialog = (event: Event) => {
    setSelectedEvent(event);
    setDetailsDialogOpen(true);
  };

  const getEventTypeColor = (tipo: EventoTipo) => {
    switch (tipo) {
      case 'prova': return 'bg-red-100 text-red-800';
      case 'estagio': return 'bg-blue-100 text-blue-800';
      case 'reuniao': return 'bg-yellow-100 text-yellow-800';
      case 'evento_interno': return 'bg-purple-100 text-purple-800';
      case 'treino': return 'bg-green-100 text-green-800';
      case 'outro': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeLabel = (tipo: EventoTipo) => {
    switch (tipo) {
      case 'prova': return 'Prova';
      case 'estagio': return 'Estágio';
      case 'reuniao': return 'Reunião';
      case 'evento_interno': return 'Evento Interno';
      case 'treino': return 'Treino';
      case 'outro': return 'Outro';
      default: return tipo;
    }
  };

  const getEventStatusColor = (estado: Event['estado']) => {
    switch (estado) {
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'agendado': return 'bg-green-100 text-green-800';
      case 'em_curso': return 'bg-blue-100 text-blue-800';
      case 'concluido': return 'bg-slate-100 text-slate-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventStatusLabel = (estado: Event['estado']) => {
    switch (estado) {
      case 'rascunho': return 'Rascunho';
      case 'agendado': return 'Agendado';
      case 'em_curso': return 'Em Curso';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {filteredEvents.length} de {events?.length || 0} eventos
          </div>
          
          {selectedEventIds.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {selectedEventIds.length} selecionado{selectedEventIds.length > 1 ? 's' : ''}
              </Badge>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteMultipleEvents}
                className="h-7 text-xs"
              >
                <Trash className="mr-1.5" size={14} />
                Eliminar Selecionados
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEventIds([])}
                className="h-7 text-xs"
              >
                Limpar Seleção
              </Button>
            </div>
          )}
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingEvent(null); }} className="h-8 text-xs">
              <Plus className="mr-1.5 sm:mr-2" size={16} />
              <span className="hidden sm:inline">Novo Evento</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
              <DialogDescription>
                {editingEvent ? 'Altere os detalhes do evento' : 'Crie um novo evento desportivo ou atividade do clube'}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Nome do evento"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({ ...formData, tipo: value as EventoTipo, tipo_piscina: value === 'prova' ? formData.tipo_piscina : '' })}
                    >
                      <SelectTrigger id="tipo">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prova">Prova</SelectItem>
                        <SelectItem value="estagio">Estágio</SelectItem>
                        <SelectItem value="reuniao">Reunião</SelectItem>
                        <SelectItem value="evento_interno">Evento Interno</SelectItem>
                        <SelectItem value="treino">Treino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.tipo === 'prova' && (
                    <div className="space-y-2">
                      <Label htmlFor="tipo_piscina">Tipo de Piscina *</Label>
                      <Select
                        value={formData.tipo_piscina}
                        onValueChange={(value) => setFormData({ ...formData, tipo_piscina: value as 'piscina_25m' | 'piscina_50m' | 'aguas_abertas' })}
                      >
                        <SelectTrigger id="tipo_piscina">
                          <SelectValue placeholder="Selecionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="piscina_25m">Piscina de 25 Metros</SelectItem>
                          <SelectItem value="piscina_50m">Piscina de 50 Metros</SelectItem>
                          <SelectItem value="aguas_abertas">Águas Abertas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="centro_custo">Centro de Custo</Label>
                    <Select
                      value={formData.centro_custo_id}
                      onValueChange={(value) => setFormData({ ...formData, centro_custo_id: value })}
                    >
                      <SelectTrigger id="centro_custo">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(centrosCusto || []).filter(cc => cc.ativo).map(cc => (
                          <SelectItem key={cc.id} value={cc.id}>{cc.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Detalhes do evento"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_inicio">Data Início *</Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hora_inicio">Hora Início</Label>
                    <Input
                      id="hora_inicio"
                      type="time"
                      value={formData.hora_inicio}
                      onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_fim">Data Fim</Label>
                    <Input
                      id="data_fim"
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hora_fim">Hora Fim</Label>
                    <Input
                      id="hora_fim"
                      type="time"
                      value={formData.hora_fim}
                      onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="local">Local</Label>
                    <Input
                      id="local"
                      value={formData.local}
                      onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                      placeholder="Nome do local"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="local_detalhes">Morada / Detalhes Local</Label>
                    <Input
                      id="local_detalhes"
                      value={formData.local_detalhes}
                      onChange={(e) => setFormData({ ...formData, local_detalhes: e.target.value })}
                      placeholder="Morada completa"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Escalões Elegíveis</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {escaloesList.map(escalao => (
                        <div key={escalao.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`escalao-${escalao.id}`}
                            checked={formData.escaloes_elegiveis.includes(escalao.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  escaloes_elegiveis: [...formData.escaloes_elegiveis, escalao.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  escaloes_elegiveis: formData.escaloes_elegiveis.filter(e => e !== escalao.id)
                                });
                              }
                            }}
                          />
                          <label htmlFor={`escalao-${escalao.id}`} className="text-sm cursor-pointer">
                            {escalao.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 md:col-span-2 border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="transporte_necessario"
                        checked={formData.transporte_necessario}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, transporte_necessario: !!checked })
                        }
                      />
                      <label htmlFor="transporte_necessario" className="text-sm font-medium cursor-pointer">
                        Transporte Necessário
                      </label>
                    </div>

                    {formData.transporte_necessario && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                        <div className="space-y-2">
                          <Label htmlFor="hora_partida">Hora de Partida</Label>
                          <Input
                            id="hora_partida"
                            type="time"
                            value={formData.hora_partida}
                            onChange={(e) => setFormData({ ...formData, hora_partida: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="local_partida">Local de Partida</Label>
                          <Input
                            id="local_partida"
                            value={formData.local_partida}
                            onChange={(e) => setFormData({ ...formData, local_partida: e.target.value })}
                            placeholder="Ex: Sede do Clube"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="transporte_detalhes">Detalhes de Transporte</Label>
                          <Textarea
                            id="transporte_detalhes"
                            value={formData.transporte_detalhes}
                            onChange={(e) => setFormData({ ...formData, transporte_detalhes: e.target.value })}
                            placeholder="Ex: Autocarro, número de lugares, etc."
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {formData.tipo === 'prova' && (
                    <>
                      <div className="space-y-2 border-t pt-4">
                        <Label htmlFor="custo_inscricao_por_prova">Custo de Inscrição por Prova (€)</Label>
                        <Input
                          id="custo_inscricao_por_prova"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.custo_inscricao_por_prova}
                          onChange={(e) => setFormData({ ...formData, custo_inscricao_por_prova: parseFloat(e.target.value) || 0 })}
                        />
                      </div>

                      <div className="space-y-2 border-t pt-4">
                        <Label htmlFor="custo_inscricao_por_salto">Custo de Inscrição por Salto (€)</Label>
                        <Input
                          id="custo_inscricao_por_salto"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.custo_inscricao_por_salto}
                          onChange={(e) => setFormData({ ...formData, custo_inscricao_por_salto: parseFloat(e.target.value) || 0 })}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="custo_inscricao_estafeta">Custo de Estafeta (€)</Label>
                        <Input
                          id="custo_inscricao_estafeta"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.custo_inscricao_estafeta}
                          onChange={(e) => setFormData({ ...formData, custo_inscricao_estafeta: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      placeholder="Notas adicionais"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2 border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recorrente"
                        checked={formData.recorrente}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, recorrente: !!checked })
                        }
                      />
                      <label htmlFor="recorrente" className="text-sm font-medium cursor-pointer">
                        Evento Recorrente
                      </label>
                    </div>

                    {formData.recorrente && (
                      <div className="space-y-4 pl-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="recorrencia_data_inicio">Data Início Recorrência *</Label>
                            <Input
                              id="recorrencia_data_inicio"
                              type="date"
                              value={formData.recorrencia_data_inicio}
                              onChange={(e) => setFormData({ ...formData, recorrencia_data_inicio: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="recorrencia_data_fim">Data Fim Recorrência *</Label>
                            <Input
                              id="recorrencia_data_fim"
                              type="date"
                              value={formData.recorrencia_data_fim}
                              onChange={(e) => setFormData({ ...formData, recorrencia_data_fim: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Dias da Semana *</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                              { value: 1, label: 'Segunda-feira' },
                              { value: 2, label: 'Terça-feira' },
                              { value: 3, label: 'Quarta-feira' },
                              { value: 4, label: 'Quinta-feira' },
                              { value: 5, label: 'Sexta-feira' },
                              { value: 6, label: 'Sábado' },
                              { value: 0, label: 'Domingo' },
                            ].map(dia => (
                              <div key={dia.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`dia-${dia.value}`}
                                  checked={formData.recorrencia_dias_semana.includes(dia.value)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setFormData({
                                        ...formData,
                                        recorrencia_dias_semana: [...formData.recorrencia_dias_semana, dia.value]
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        recorrencia_dias_semana: formData.recorrencia_dias_semana.filter(d => d !== dia.value)
                                      });
                                    }
                                  }}
                                />
                                <label htmlFor={`dia-${dia.value}`} className="text-sm cursor-pointer">
                                  {dia.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); setEditingEvent(null); }}>
                Cancelar
              </Button>
              <Button onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}>
                {editingEvent ? 'Atualizar' : 'Criar'} Evento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-2 sm:p-3">
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex flex-col gap-2 sm:gap-3 md:flex-row">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Pesquisar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 h-8 text-xs"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[160px] h-8 text-xs">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="prova">Prova</SelectItem>
                <SelectItem value="estagio">Estágio</SelectItem>
                <SelectItem value="reuniao">Reunião</SelectItem>
                <SelectItem value="evento_interno">Evento Interno</SelectItem>
                <SelectItem value="treino">Treino</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[160px] h-8 text-xs">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Estados</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="em_curso">Em Curso</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {filteredEvents.length > 0 && (
            <div className="flex items-center gap-2 border-t pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                className="h-7 text-xs"
              >
                {isAllSelected ? (
                  <>
                    <CheckSquare className="mr-1.5" size={14} />
                    Desselecionar Todos
                  </>
                ) : (
                  <>
                    <Square className="mr-1.5" size={14} />
                    Selecionar Todos
                  </>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                Selecione eventos para eliminar múltiplos de uma vez
              </span>
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-2 sm:gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map(event => (
          <Card
            key={event.id}
            className={`p-2.5 sm:p-3 transition-all hover:shadow-md relative ${
              selectedEventIds.includes(event.id) 
                ? 'border-primary border-2 bg-primary/5' 
                : 'hover:border-primary/50'
            }`}
          >
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={selectedEventIds.includes(event.id)}
                onCheckedChange={() => toggleEventSelection(event.id)}
                onClick={(e) => e.stopPropagation()}
                className="h-5 w-5"
              />
            </div>
            
            <div 
              className="space-y-2 pl-8 cursor-pointer"
              onClick={() => openDetailsDialog(event)}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm sm:text-base line-clamp-2 flex-1">{event.titulo}</h3>
                <Badge className={`${getEventTypeColor(event.tipo)} text-xs flex-shrink-0`}>
                  {getEventTypeLabel(event.tipo)}
                </Badge>
              </div>
              
              {event.descricao && (
                <p className="text-xs text-muted-foreground line-clamp-2">{event.descricao}</p>
              )}
              
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarBlank size={14} className="flex-shrink-0" />
                <span className="truncate">
                  {format(new Date(event.data_inicio), 'PPP', { locale: pt })}
                  {event.hora_inicio && ` às ${event.hora_inicio}`}
                </span>
              </div>
              
              {event.local && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin size={14} className="flex-shrink-0" />
                  <span className="truncate">{event.local}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 items-center">
                <Badge className={`${getEventStatusColor(event.estado)} text-xs`}>
                  {getEventStatusLabel(event.estado)}
                </Badge>

                {event.recorrente && (
                  <Badge variant="outline" className="text-xs bg-blue-50">
                    <Repeat size={12} className="mr-1" />
                    Recorrente
                  </Badge>
                )}

                {event.evento_pai_id && (
                  <Badge variant="outline" className="text-xs bg-blue-50">
                    <Repeat size={12} className="mr-1" />
                    Série
                  </Badge>
                )}

                {event.transporte_necessario && (
                  <Badge variant="outline" className="text-xs">
                    <Car size={12} className="mr-1" />
                    Transporte
                  </Badge>
                )}

                {event.taxa_inscricao && event.taxa_inscricao > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <CurrencyEur size={12} className="mr-1" />
                    {event.taxa_inscricao.toFixed(2)}
                  </Badge>
                )}

                {event.escaloes_elegiveis && event.escaloes_elegiveis.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Users size={12} className="mr-1" />
                    {event.escaloes_elegiveis.length} escalão{event.escaloes_elegiveis.length > 1 ? 'ões' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card className="p-6 sm:p-8">
          <div className="text-center">
            <CalendarBlank className="mx-auto text-muted-foreground mb-2 sm:mb-3" size={40} weight="thin" />
            <h3 className="font-semibold text-sm mb-0.5">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground text-xs">
              Crie o seu primeiro evento para começar.
            </p>
          </div>
        </Card>
      )}

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{selectedEvent.titulo}</DialogTitle>
                <DialogDescription>Detalhes completos do evento</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getEventTypeColor(selectedEvent.tipo)}>
                      {getEventTypeLabel(selectedEvent.tipo)}
                    </Badge>
                    <Badge className={getEventStatusColor(selectedEvent.estado)}>
                      {getEventStatusLabel(selectedEvent.estado)}
                    </Badge>
                    {selectedEvent.recorrente && (
                      <Badge variant="outline" className="bg-blue-50">
                        <Repeat size={14} className="mr-1" />
                        Evento Recorrente
                      </Badge>
                    )}
                    {selectedEvent.evento_pai_id && (
                      <Badge variant="outline" className="bg-blue-50">
                        <Repeat size={14} className="mr-1" />
                        Evento de Série
                      </Badge>
                    )}
                  </div>

                  {selectedEvent.recorrente && selectedEvent.recorrencia_data_inicio && selectedEvent.recorrencia_data_fim && (
                    <div className="border-l-4 border-blue-200 pl-4 py-2 bg-blue-50/50 rounded">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Repeat size={16} />
                        Configuração de Recorrência
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Data Início Recorrência</Label>
                          <p className="text-sm mt-1">
                            {format(new Date(selectedEvent.recorrencia_data_inicio), 'PPP', { locale: pt })}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Data Fim Recorrência</Label>
                          <p className="text-sm mt-1">
                            {format(new Date(selectedEvent.recorrencia_data_fim), 'PPP', { locale: pt })}
                          </p>
                        </div>
                        {selectedEvent.recorrencia_dias_semana && selectedEvent.recorrencia_dias_semana.length > 0 && (
                          <div className="md:col-span-2">
                            <Label className="text-xs text-muted-foreground">Dias da Semana</Label>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {selectedEvent.recorrencia_dias_semana.map(dia => (
                                <Badge key={dia} variant="outline" className="text-xs">
                                  {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dia]}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedEvent.descricao && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Descrição</Label>
                      <p className="text-sm mt-1">{selectedEvent.descricao}</p>
                    </div>
                  )}

                  {selectedEvent.tipo === 'prova' && selectedEvent.tipo_piscina && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Tipo de Piscina</Label>
                      <p className="text-sm mt-1">
                        {selectedEvent.tipo_piscina === 'piscina_25m' && 'Piscina de 25 Metros'}
                        {selectedEvent.tipo_piscina === 'piscina_50m' && 'Piscina de 50 Metros'}
                        {selectedEvent.tipo_piscina === 'aguas_abertas' && 'Águas Abertas'}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Data Início</Label>
                      <p className="text-sm mt-1">
                        {format(new Date(selectedEvent.data_inicio), 'PPP', { locale: pt })}
                        {selectedEvent.hora_inicio && ` às ${selectedEvent.hora_inicio}`}
                      </p>
                    </div>

                    {selectedEvent.data_fim && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Data Fim</Label>
                        <p className="text-sm mt-1">
                          {format(new Date(selectedEvent.data_fim), 'PPP', { locale: pt })}
                          {selectedEvent.hora_fim && ` às ${selectedEvent.hora_fim}`}
                        </p>
                      </div>
                    )}

                    {selectedEvent.local && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Local</Label>
                        <p className="text-sm mt-1">{selectedEvent.local}</p>
                      </div>
                    )}

                    {selectedEvent.local_detalhes && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Morada</Label>
                        <p className="text-sm mt-1">{selectedEvent.local_detalhes}</p>
                      </div>
                    )}
                  </div>

                  {selectedEvent.escaloes_elegiveis && selectedEvent.escaloes_elegiveis.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Escalões Elegíveis</Label>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedEvent.escaloes_elegiveis.map(escalaoId => {
                          const escalao = (ageGroups || []).find(ag => ag.id === escalaoId);
                          return escalao ? (
                            <Badge key={escalaoId} variant="outline" className="text-xs">
                              {escalao.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {selectedEvent.transporte_necessario && (
                    <div className="border-t pt-4">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Car size={16} />
                        Transporte
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {selectedEvent.hora_partida && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Hora de Partida</Label>
                            <p className="text-sm mt-1">{selectedEvent.hora_partida}</p>
                          </div>
                        )}
                        {selectedEvent.local_partida && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Local de Partida</Label>
                            <p className="text-sm mt-1">{selectedEvent.local_partida}</p>
                          </div>
                        )}
                        {selectedEvent.transporte_detalhes && (
                          <div className="md:col-span-2">
                            <Label className="text-xs text-muted-foreground">Detalhes</Label>
                            <p className="text-sm mt-1">{selectedEvent.transporte_detalhes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedEvent.taxa_inscricao && selectedEvent.taxa_inscricao > 0 && (
                    <div className="border-t pt-4">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <CurrencyEur size={16} />
                        Taxa de Inscrição
                      </Label>
                      <p className="text-sm mt-1">€{selectedEvent.taxa_inscricao.toFixed(2)}</p>
                    </div>
                  )}

                  {selectedEvent.observacoes && (
                    <div className="border-t pt-4">
                      <Label className="text-xs text-muted-foreground">Observações</Label>
                      <p className="text-sm mt-1">{selectedEvent.observacoes}</p>
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-2">
                    <Label className="text-sm font-semibold">Alterar Estado</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={selectedEvent.estado === 'agendado' ? 'default' : 'outline'}
                        onClick={() => handleChangeStatus(selectedEvent.id, 'agendado')}
                        className="text-xs"
                      >
                        Agendado
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedEvent.estado === 'em_curso' ? 'default' : 'outline'}
                        onClick={() => handleChangeStatus(selectedEvent.id, 'em_curso')}
                        className="text-xs"
                      >
                        Em Curso
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedEvent.estado === 'concluido' ? 'default' : 'outline'}
                        onClick={() => handleChangeStatus(selectedEvent.id, 'concluido')}
                        className="text-xs"
                      >
                        Concluído
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedEvent.estado === 'cancelado' ? 'destructive' : 'outline'}
                        onClick={() => handleChangeStatus(selectedEvent.id, 'cancelado')}
                        className="text-xs"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="mt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                >
                  <Trash className="mr-2" size={16} />
                  Eliminar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    openEditDialog(selectedEvent);
                  }}
                >
                  <Pencil className="mr-2" size={16} />
                  Editar
                </Button>
                <Button size="sm" onClick={() => setDetailsDialogOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar {selectedEventIds.length} evento{selectedEventIds.length > 1 ? 's' : ''}?
              Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMultiple} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
