import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
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
  Pencil,
  Trash,
  MapPin,
  Clock,
  Users,
  CheckSquare,
} from '@phosphor-icons/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
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
}

interface EventosListProps {
  events: Event[];
  users?: any[];
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
}: EventosListProps) {
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
    local: '',
    tipo: 'evento_interno',
    estado: 'agendado',
    recorrente: false,
    recorrencia_data_inicio: '',
    recorrencia_data_fim: '',
    recorrencia_dias_semana: [] as string[],
  });

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.titulo
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'todos' || event.tipo === typeFilter;
    const matchesStatus = statusFilter === 'todos' || event.estado === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

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
      local: '',
      tipo: 'evento_interno',
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 flex-1">
          <div className="flex-1">
            <Input
              placeholder="Pesquisar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="treino">Treino</SelectItem>
              <SelectItem value="prova">Prova</SelectItem>
              <SelectItem value="evento_interno">Evento Interno</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os estados</SelectItem>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="em_curso">Em Curso</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {selectedEvents.size > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setIsBulkDeleteDialogOpen(true)}
            >
              <Trash size={16} className="mr-2" />
              Eliminar ({selectedEvents.size})
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} size="sm">
                <Plus size={16} className="mr-2" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Editar Evento' : 'Novo Evento'}
              </DialogTitle>
              <DialogDescription>
                {editingEvent
                  ? 'Atualize os detalhes do evento'
                  : 'Crie um novo evento para o clube'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  placeholder="Ex: Treino de Natação"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  placeholder="Detalhes adicionais..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio">Data *</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) =>
                      setFormData({ ...formData, data_inicio: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora_inicio">Hora</Label>
                  <Input
                    id="hora_inicio"
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) =>
                      setFormData({ ...formData, hora_inicio: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) =>
                    setFormData({ ...formData, local: e.target.value })
                  }
                  placeholder="Ex: Piscina Municipal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Evento *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tipo: value })
                    }
                  >
                    <SelectTrigger id="tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="treino">Treino</SelectItem>
                      <SelectItem value="prova">Prova</SelectItem>
                      <SelectItem value="evento_interno">Evento Interno</SelectItem>
                      <SelectItem value="reuniao">Reunião</SelectItem>
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
                    <SelectTrigger id="estado">
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

              {/* Recurrence section */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="recorrente"
                    checked={formData.recorrente}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, recorrente: checked as boolean })
                    }
                  />
                  <Label htmlFor="recorrente" className="cursor-pointer">
                    Este evento é recorrente
                  </Label>
                </div>

                {formData.recorrente && (
                  <div className="space-y-4 bg-slate-50 p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="recorrencia_data_inicio">
                          Data de Início da Recorrência *
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
                          Data de Fim da Recorrência *
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
                      <div className="grid grid-cols-3 gap-3">
                        {daysOfWeek.map((day) => (
                          <div key={day.id} className="flex items-center gap-2">
                            <Checkbox
                              id={day.id}
                              checked={formData.recorrencia_dias_semana.includes(
                                day.value
                              )}
                              onCheckedChange={(checked) => {
                                const updated = formData.recorrencia_dias_semana;
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
                                  recorrencia_dias_semana: [...updated],
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

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedEvents.size === filteredEvents.length &&
                    filteredEvents.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhum evento encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow
                  key={event.id}
                  className={selectedEvents.has(event.id) ? 'bg-muted/50' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedEvents.has(event.id)}
                      onCheckedChange={() => toggleEventSelection(event.id)}
                      aria-label={`Selecionar ${event.titulo}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{event.titulo}</TableCell>
                  <TableCell>
                    {format(
                      new Date(event.data_inicio),
                      "dd 'de' MMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </TableCell>
                  <TableCell>{event.local}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{event.tipo}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        event.estado === 'concluido'
                          ? 'default'
                          : event.estado === 'agendado'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {event.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingEvent(event);
                        setFormData({
                          titulo: event.titulo,
                          descricao: '',
                          data_inicio: event.data_inicio,
                          hora_inicio: event.hora_inicio || '',
                          local: event.local,
                          tipo: event.tipo,
                          estado: event.estado,
                          recorrente: false,
                          recorrencia_data_inicio: '',
                          recorrencia_data_fim: '',
                          recorrencia_dias_semana: [],
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash size={16} className="text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

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
