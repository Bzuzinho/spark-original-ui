import { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/Components/ui/collapsible';
import {
  Plus,
  CheckCircle,
  XCircle,
  Question,
  CaretDown,
  CaretRight,
  Trash,
  UserPlus,
  UserMinus,
  Checks,
  X,
} from '@phosphor-icons/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Checkbox } from '@/Components/ui/checkbox';
import { toast } from 'sonner';
import axios from 'axios';

interface Attendance {
  id: string;
  evento_id: string;
  user_id: string;
  estado: 'presente' | 'ausente' | 'justificado';
  hora_chegada?: string;
  observacoes?: string;
  user?: {
    id: string;
    nome_completo: string;
  };
}

interface AttendanceGroup {
  evento_id: string;
  evento_titulo: string;
  evento_tipo: string;
  evento_data: string;
  attendances: Attendance[];
}

interface PresencasListProps {
  events: any[];
  attendances?: Attendance[];
  users?: any[];
}

export function PresencasList({ events = [], attendances: initialAttendances = [], users = [] }: PresencasListProps) {
  const [attendances, setAttendances] = useState<Attendance[]>(initialAttendances);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('todos');
  const [presenceFilter, setPresenceFilter] = useState('todos');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddAthleteDialogOpen, setIsAddAthleteDialogOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState('');
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [deletingGroup, setDeletingGroup] = useState<AttendanceGroup | null>(null);
  const [editingGroup, setEditingGroup] = useState<AttendanceGroup | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Carregar presenças
  const loadAttendances = async () => {
    try {
      const response = await axios.get('/api/event-attendances');
      setAttendances(response.data);
    } catch (error) {
      console.error('Erro ao carregar presenças:', error);
    }
  };

  useEffect(() => {
    setAttendances(initialAttendances);
  }, [initialAttendances]);

  // Agrupar presenças por evento
  const attendanceGroups: AttendanceGroup[] = events
    .filter((e) => e.tipo === 'treino' || attendances.some((a) => a.evento_id === e.id))
    .map((event) => {
      const eventAttendances = attendances.filter((a) => a.evento_id === event.id);
      return {
        evento_id: event.id,
        evento_titulo: event.titulo,
        evento_tipo: event.tipo,
        evento_data: event.data_inicio,
        attendances: eventAttendances,
      };
    })
    .filter((group) => {
      const matchesEvent = eventFilter === 'todos' || group.evento_id === eventFilter;
      const matchesSearch = group.evento_titulo.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesEvent && matchesSearch;
    });

  const handleCreateGroup = () => {
    setSelectedEvento('');
    setSelectedAthletes([]);
    setIsCreateDialogOpen(true);
  };

  const handleSelectEvent = (eventoId: string) => {
    setSelectedEvento(eventoId);
    const event = events.find((e) => e.id === eventoId);
    
    // Pré-selecionar atletas do escalão do evento
    if (event && event.escaloes_elegiveis && event.escaloes_elegiveis.length > 0) {
      const athletesInEscaloes = users.filter((user: any) => {
        const userEscaloes = Array.isArray(user.escalao) ? user.escalao : [];
        return event.escaloes_elegiveis.some((e: string) => userEscaloes.includes(e));
      });
      setSelectedAthletes(athletesInEscaloes.map((a: any) => a.id));
    } else {
      setSelectedAthletes([]);
    }
  };

  const handleToggleAthlete = (userId: string) => {
    setSelectedAthletes((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateAttendances = async () => {
    if (!selectedEvento) {
      toast.error('Selecione um evento');
      return;
    }

    setIsLoading(true);
    try {
      // Criar registo de presença para cada atleta selecionado
      const promises = selectedAthletes.map((userId) =>
        axios.post('/api/event-attendances', {
          evento_id: selectedEvento,
          user_id: userId,
          estado: 'ausente', // Estado inicial
        })
      );

      await Promise.all(promises);
      toast.success('Grupo de presenças criado com sucesso!');
      setIsCreateDialogOpen(false);
      loadAttendances();
    } catch (error: any) {
      console.error('Erro ao criar presenças:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar presenças');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAttendance = async (attendanceId: string, estado: string) => {
    try {
      await axios.put(`/api/event-attendances/${attendanceId}`, { estado });
      toast.success('Presença atualizada!');
      loadAttendances();
    } catch (error: any) {
      console.error('Erro ao atualizar presença:', error);
      toast.error('Erro ao atualizar presença');
    }
  };

  const handleSetAllPresent = async (group: AttendanceGroup) => {
    setIsLoading(true);
    try {
      const promises = group.attendances.map((att) =>
        axios.put(`/api/event-attendances/${att.id}`, { estado: 'presente' })
      );
      await Promise.all(promises);
      toast.success('Todos marcados como presentes!');
      loadAttendances();
    } catch (error) {
      toast.error('Erro ao atualizar presenças');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetAllAbsent = async (group: AttendanceGroup) => {
    setIsLoading(true);
    try {
      const promises = group.attendances.map((att) =>
        axios.put(`/api/event-attendances/${att.id}`, { estado: 'ausente' })
      );
      await Promise.all(promises);
      toast.success('Todos marcados como ausentes!');
      loadAttendances();
    } catch (error) {
      toast.error('Erro ao atualizar presenças');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = (group: AttendanceGroup) => {
    setDeletingGroup(group);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteGroup = async () => {
    if (!deletingGroup) return;

    setIsLoading(true);
    try {
      const promises = deletingGroup.attendances.map((att) =>
        axios.delete(`/api/event-attendances/${att.id}`)
      );
      await Promise.all(promises);
      toast.success('Grupo eliminado com sucesso!');
      setIsDeleteDialogOpen(false);
      setDeletingGroup(null);
      loadAttendances();
    } catch (error) {
      toast.error('Erro ao eliminar grupo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAthlete = (group: AttendanceGroup) => {
    setEditingGroup(group);
    setSelectedAthletes([]);
    setIsAddAthleteDialogOpen(true);
  };

  const handleAddAthleteToGroup = async () => {
    if (!editingGroup || selectedAthletes.length === 0) return;

    setIsLoading(true);
    try {
      const promises = selectedAthletes.map((userId) =>
        axios.post('/api/event-attendances', {
          evento_id: editingGroup.evento_id,
          user_id: userId,
          estado: 'ausente',
        })
      );
      await Promise.all(promises);
      toast.success('Atletas adicionados!');
      setIsAddAthleteDialogOpen(false);
      loadAttendances();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao adicionar atletas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAthlete = async (attendanceId: string) => {
    try {
      await axios.delete(`/api/event-attendances/${attendanceId}`);
      toast.success('Atleta removido!');
      loadAttendances();
    } catch (error) {
      toast.error('Erro ao remover atleta');
    }
  };

  const toggleGroupCollapse = (eventoId: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventoId)) {
        newSet.delete(eventoId);
      } else {
        newSet.add(eventoId);
      }
      return newSet;
    });
  };

  const getStateColor = (estado: string) => {
    switch (estado) {
      case 'presente':
        return 'bg-green-100 text-green-700';
      case 'ausente':
        return 'bg-red-100 text-red-700';
      case 'justificado':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getGroupStats = (group: AttendanceGroup) => {
    const total = group.attendances.length;
    const presentes = group.attendances.filter((a) => a.estado === 'presente').length;
    const ausentes = group.attendances.filter((a) => a.estado === 'ausente').length;
    const justificados = group.attendances.filter((a) => a.estado === 'justificado').length;
    const taxa = total > 0 ? ((presentes / total) * 100).toFixed(0) : 0;

    return { total, presentes, ausentes, justificados, taxa };
  };

  // Filtrar atletas que já estão no grupo
  const getAvailableAthletes = (group?: AttendanceGroup) => {
    if (!group) return users;
    const existingUserIds = group.attendances.map((a) => a.user_id);
    return users.filter((u: any) => !existingUserIds.includes(u.id));
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold">Gestão de Presenças</h3>
            <p className="text-sm text-muted-foreground">
              {attendanceGroups.length} grupo(s) de presença
            </p>
          </div>
          <Button onClick={handleCreateGroup} size="sm">
            <Plus size={16} className="mr-2" />
            Criar Grupo de Presenças
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 items-center flex-wrap mb-4">
          <Input
            placeholder="Pesquisar evento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-64"
          />
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os eventos</SelectItem>
              <SelectItem value="treino">Treinos</SelectItem>
              <SelectItem value="prova">Provas</SelectItem>
              <SelectItem value="competicao">Competições</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grupos de Presença */}
        <div className="space-y-3">
          {attendanceGroups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum grupo de presença encontrado</p>
              <Button variant="link" onClick={handleCreateGroup} className="mt-2">
                Criar primeiro grupo
              </Button>
            </div>
          ) : (
            attendanceGroups.map((group) => {
              const stats = getGroupStats(group);
              const isCollapsed = collapsedGroups.has(group.evento_id);

              return (
                <Card key={group.evento_id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroupCollapse(group.evento_id)}
                      >
                        {isCollapsed ? (
                          <CaretRight size={16} />
                        ) : (
                          <CaretDown size={16} />
                        )}
                      </Button>
                      <div className="flex-1">
                        <h4 className="font-semibold">{group.evento_titulo}</h4>
                        <div className="flex gap-2 items-center text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {group.evento_tipo}
                          </Badge>
                          <span>{group.evento_data}</span>
                          <span>•</span>
                          <span>
                            {stats.presentes}/{stats.total} presentes ({stats.taxa}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetAllPresent(group)}
                        disabled={isLoading}
                      >
                        <Checks size={14} className="mr-1" />
                        Todos Presentes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetAllAbsent(group)}
                        disabled={isLoading}
                      >
                        <X size={14} className="mr-1" />
                        Todos Ausentes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddAthlete(group)}
                      >
                        <UserPlus size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteGroup(group)}
                        className="text-destructive"
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Atleta</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Hora Chegada</TableHead>
                            <TableHead>Observações</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.attendances.map((att) => {
                            const user = users.find((u: any) => u.id === att.user_id);
                            return (
                              <TableRow key={att.id}>
                                <TableCell>{user?.nome_completo || 'N/A'}</TableCell>
                                <TableCell>
                                  <Select
                                    value={att.estado}
                                    onValueChange={(value) =>
                                      handleUpdateAttendance(att.id, value)
                                    }
                                  >
                                    <SelectTrigger className="w-40">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="presente">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle
                                            size={14}
                                            className="text-green-600"
                                          />
                                          Presente
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="ausente">
                                        <div className="flex items-center gap-2">
                                          <XCircle size={14} className="text-red-600" />
                                          Ausente
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="justificado">
                                        <div className="flex items-center gap-2">
                                          <Question size={14} className="text-yellow-600" />
                                          Justificado
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  {att.hora_chegada || '-'}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {att.observacoes || '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveAthlete(att.id)}
                                    className="text-destructive"
                                  >
                                    <UserMinus size={14} />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {group.attendances.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-4 text-muted-foreground"
                              >
                                Nenhum atleta no grupo
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </Card>

      {/* Dialog - Criar Grupo de Presenças */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Grupo de Presenças</DialogTitle>
            <DialogDescription>
              Selecione o evento e os atletas para criar o grupo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Evento <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedEvento} onValueChange={handleSelectEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o evento" />
                </SelectTrigger>
                <SelectContent>
                  {events
                    .filter((e) => e.tipo === 'treino' || e.tipo === 'prova')
                    .map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.titulo} - {event.data_inicio}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEvento && (
              <div className="space-y-2">
                <Label>Atletas ({selectedAthletes.length} selecionados)</Label>
                <div className="border rounded-md p-4 max-h-96 overflow-y-auto space-y-2">
                  {users.map((user: any) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedAthletes.includes(user.id)}
                        onCheckedChange={() => handleToggleAthlete(user.id)}
                      />
                      <label
                        htmlFor={`user-${user.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {user.nome_completo}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateAttendances} disabled={isLoading || !selectedEvento}>
              {isLoading ? 'Criando...' : 'Criar Grupo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog - Adicionar Atleta ao Grupo */}
      <Dialog open={isAddAthleteDialogOpen} onOpenChange={setIsAddAthleteDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Atletas</DialogTitle>
            <DialogDescription>
              Selecione os atletas para adicionar ao grupo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="border rounded-md p-4 max-h-96 overflow-y-auto space-y-2">
              {getAvailableAthletes(editingGroup || undefined).map((user: any) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`add-user-${user.id}`}
                    checked={selectedAthletes.includes(user.id)}
                    onCheckedChange={() => handleToggleAthlete(user.id)}
                  />
                  <label
                    htmlFor={`add-user-${user.id}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {user.nome_completo}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddAthleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddAthleteToGroup}
              disabled={isLoading || selectedAthletes.length === 0}
            >
              {isLoading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog - Confirmação de Eliminação */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar este grupo de presenças? Esta ação não pode
              ser desfeita.
              {deletingGroup && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Evento:</strong> {deletingGroup.evento_titulo}
                  <br />
                  <strong>Atletas:</strong> {deletingGroup.attendances.length}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGroup}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

