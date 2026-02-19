import { useState } from 'react';
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
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
  Plus,
  MagnifyingGlass,
  Pencil,
  Trash,
  MapPin,
  Clock,
  Users,
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
}

interface EventosListProps {
  events: Event[];
  users?: any[];
  onEventCreate?: (event: Event) => void;
  onEventUpdate?: (event: Event) => void;
  onEventDelete?: (id: string) => void;
}

export function EventosList({
  events = [],
  users = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
}: EventosListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    hora_inicio: '',
    local: '',
    tipo: 'evento_interno',
    estado: 'agendado',
  });

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.titulo
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'todos' || event.tipo === typeFilter;
    const matchesStatus = statusFilter === 'todos' || event.estado === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSave = () => {
    if (!formData.titulo.trim()) {
      toast.error('Preencha o título do evento');
      return;
    }

    if (editingEvent) {
      const updated = { ...editingEvent, ...formData };
      onEventUpdate?.(updated);
      toast.success('Evento atualizado com sucesso!');
    } else {
      const newEvent: Event = {
        id: crypto.randomUUID(),
        ...formData,
      };
      onEventCreate?.(newEvent);
      toast.success('Evento criado com sucesso!');
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este evento?')) {
      onEventDelete?.(id);
      toast.success('Evento eliminado com sucesso!');
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
    });
    setEditingEvent(null);
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
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="em_curso">Em Curso</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum evento encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event.id}>
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
    </div>
  );
}
