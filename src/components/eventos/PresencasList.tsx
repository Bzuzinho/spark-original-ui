import { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Event, User, EventoPresenca, EstadoPresenca } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, MagnifyingGlass, CheckCircle, XCircle, ClipboardText, Trash, CaretDown, CaretUp, Question } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { getEscaloesNames } from '@/lib/user-helpers';

export function PresencasList() {
  const [events] = useKV<Event[]>('club-events', []);
  const [presencas, setPresencas] = useKV<EventoPresenca[]>('club-presencas', []);
  const [users] = useKV<User[]>('club-users', []);
  const [ageGroups] = useKV<any[]>('settings-age-groups', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('todos');
  const [presenceFilter, setPresenceFilter] = useState<string>('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [presencaData, setPresencaData] = useState<{
    [userId: string]: { estado: EstadoPresenca | ''; hora_chegada?: string; observacoes?: string };
  }>({});
  const [expandedCards, setExpandedCards] = useState<{ [eventId: string]: boolean }>({});
  const [hiddenEmptyTreinos, setHiddenEmptyTreinos] = useState<string[]>([]);

  const activeEvents = useMemo(() => {
    return (events || []).filter(e => 
      e.estado === 'agendado' || e.estado === 'em_curso' || e.estado === 'concluido'
    ).sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime());
  }, [events]);

  const filteredPresencas = useMemo(() => {
    return (presencas || []).filter(pres => {
      const user = users?.find(u => u.id === pres.user_id);
      const event = events?.find(e => e.id === pres.evento_id);
      
      const matchesSearch = 
        user?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event?.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEvent = eventFilter === 'todos' || pres.evento_id === eventFilter;
      const matchesPresence = 
        presenceFilter === 'todos' || 
        (presenceFilter === 'presente' && pres.estado === 'presente') ||
        (presenceFilter === 'ausente' && pres.estado === 'ausente') ||
        (presenceFilter === 'justificado' && pres.estado === 'justificado');
      
      return matchesSearch && matchesEvent && matchesPresence;
    }).sort((a, b) => new Date(b.registado_em).getTime() - new Date(a.registado_em).getTime());
  }, [presencas, users, events, searchTerm, eventFilter, presenceFilter]);

  const getAtletasForEvent = (eventoId: string) => {
    const event = events?.find(e => e.id === eventoId);
    if (!event) return [];
    
    const existingPresencas = (presencas || []).filter(p => p.evento_id === eventoId);
    const userIdsInPresencas = existingPresencas.map(p => p.user_id);
    
    const eligibleUsers = (users || []).filter(u => {
      if (userIdsInPresencas.includes(u.id)) return true;
      
      if (u.estado !== 'ativo') return false;
      
      if (!event.escaloes_elegiveis || event.escaloes_elegiveis.length === 0) return false;
      if (!u.escalao || u.escalao.length === 0) return false;
      
      return u.escalao.some(userEscalao => 
        event.escaloes_elegiveis?.includes(userEscalao)
      );
    });
    
    return eligibleUsers;
  };

  const handleOpenDialog = (eventoId?: string) => {
    if (eventoId) {
      setSelectedEvent(eventoId);
      const atletas = getAtletasForEvent(eventoId);
      const existingPresencas = (presencas || []).filter(p => p.evento_id === eventoId);
      
      const initialData: typeof presencaData = {};
      atletas.forEach(user => {
        const existing = existingPresencas.find(p => p.user_id === user.id);
        if (existing) {
          initialData[user.id] = {
            estado: existing.estado,
            hora_chegada: existing.hora_chegada,
            observacoes: existing.observacoes,
          };
        } else {
          initialData[user.id] = { estado: '' as EstadoPresenca };
        }
      });
      
      setPresencaData(initialData);
    } else {
      setSelectedEvent('');
      setPresencaData({});
    }
    setDialogOpen(true);
  };

  const handleSavePresencas = () => {
    if (!selectedEvent) {
      toast.error('Selecione um evento');
      return;
    }

    const event = events?.find(e => e.id === selectedEvent);
    if (!event) return;

    const existingPresencas = (presencas || []).filter(p => p.evento_id === selectedEvent);
    const updatedPresencas = [...(presencas || []).filter(p => p.evento_id !== selectedEvent)];

    let atletasSemClassificacao = 0;
    let presentesCount = 0;
    let justificadosCount = 0;
    let ausentesCount = 0;

    Object.entries(presencaData).forEach(([userId, data]) => {
      if (!data.estado) {
        atletasSemClassificacao++;
        return;
      }
      
      if (data.estado === 'presente') {
        presentesCount++;
      } else if (data.estado === 'justificado') {
        justificadosCount++;
      } else if (data.estado === 'ausente') {
        ausentesCount++;
      }
      
      updatedPresencas.push({
        id: crypto.randomUUID(),
        evento_id: selectedEvent,
        user_id: userId,
        estado: data.estado as EstadoPresenca,
        hora_chegada: data.hora_chegada || undefined,
        observacoes: data.observacoes || undefined,
        registado_por: 'admin',
        registado_em: new Date().toISOString(),
      });
    });

    setPresencas(() => updatedPresencas);
    
    let message = `Presenças registadas: ${presentesCount} presentes`;
    if (ausentesCount > 0) {
      message += `, ${ausentesCount} ausentes`;
    }
    if (justificadosCount > 0) {
      message += `, ${justificadosCount} justificados`;
    }
    if (atletasSemClassificacao > 0) {
      message += ` | ${atletasSemClassificacao} atleta(s) sem classificação removidos da lista`;
    }
    
    toast.success(message);
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedEvent('');
    setPresencaData({});
  };

  const updatePresenca = (userId: string, field: string, value: any) => {
    setPresencaData(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      }
    }));
  };

  const handleDeleteEventPresencas = (eventoId: string) => {
    const event = events?.find(e => e.id === eventoId);
    const eventPresencas = (presencas || []).filter(p => p.evento_id === eventoId);
    
    if (!event) {
      toast.error('Evento não encontrado');
      return;
    }
    
    if (eventPresencas.length === 0 && event.tipo === 'treino') {
      setHiddenEmptyTreinos(prev => [...prev, eventoId]);
      toast.success(`Registo de presença vazio do treino "${event.titulo}" foi removido da visualização`);
      return;
    }
    
    if (eventPresencas.length === 0) {
      toast.error('Nenhum registo de presença encontrado para este evento');
      return;
    }
    
    if (window.confirm(`Tem a certeza que pretende apagar TODOS os ${eventPresencas.length} registos de presença do evento "${event.titulo}"?\n\nEsta ação não pode ser revertida.`)) {
      const updatedPresencas = (presencas || []).filter(p => p.evento_id !== eventoId);
      setPresencas(() => updatedPresencas);
      toast.success(`Todos os registos de presença do evento "${event.titulo}" foram apagados (${eventPresencas.length} registos)`);
    }
  };

  const getPresencaStats = (eventoId: string) => {
    const eventPresencas = (presencas || []).filter(p => p.evento_id === eventoId);
    const presentes = eventPresencas.filter(p => p.estado === 'presente').length;
    const ausentes = eventPresencas.filter(p => p.estado === 'ausente').length;
    const justificados = eventPresencas.filter(p => p.estado === 'justificado').length;
    const total = eventPresencas.length;
    
    return { presentes, ausentes, justificados, total };
  };

  const toggleCardExpansion = (eventId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const getEstadoBadge = (estado: EstadoPresenca) => {
    switch (estado) {
      case 'presente':
        return <Badge variant="default" className="bg-green-600 text-xs">Presente</Badge>;
      case 'ausente':
        return <Badge variant="destructive" className="text-xs">Ausente</Badge>;
      case 'justificado':
        return <Badge variant="secondary" className="bg-amber-500 text-white text-xs">Justificado</Badge>;
    }
  };

  const getEstadoIcon = (estado: EstadoPresenca) => {
    switch (estado) {
      case 'presente':
        return <CheckCircle size={16} className="text-green-600" weight="fill" />;
      case 'ausente':
        return <XCircle size={16} className="text-red-600" weight="fill" />;
      case 'justificado':
        return <Question size={16} className="text-amber-500" weight="fill" />;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredPresencas.length} de {presencas?.length || 0} registos de presença
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="h-8 text-xs">
              <Plus className="mr-1.5 sm:mr-2" size={16} />
              <span className="hidden sm:inline">Registar Presenças</span>
              <span className="sm:hidden">Registar</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Registar Presenças</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="evento">Evento *</Label>
                  <Select 
                    value={selectedEvent} 
                    onValueChange={(value) => handleOpenDialog(value)}
                  >
                    <SelectTrigger id="evento">
                      <SelectValue placeholder="Selecionar evento..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeEvents.map(event => {
                        const stats = getPresencaStats(event.id);
                        return (
                          <SelectItem key={event.id} value={event.id}>
                            {event.titulo} - {format(new Date(event.data_inicio), 'PPP', { locale: pt })}
                            {stats.total > 0 && ` (${stats.presentes}/${stats.total})`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedEvent && (() => {
                  const atletas = getAtletasForEvent(selectedEvent);
                  const atletasNaLista = atletas.filter(a => presencaData[a.id] !== undefined);
                  const atletasDisponiveis = (users || []).filter(u => 
                    u.tipo_membro.includes('atleta') && !presencaData[u.id]
                  );
                  
                  if (atletasNaLista.length === 0 && atletasDisponiveis.length === 0) {
                    return (
                      <Card className="p-4">
                        <p className="text-sm text-muted-foreground text-center">
                          Nenhum atleta disponível para este evento.
                        </p>
                      </Card>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Atletas na lista ({atletasNaLista.length})</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newData = { ...presencaData };
                              atletasNaLista.forEach(u => {
                                newData[u.id] = { ...newData[u.id], estado: 'presente' };
                              });
                              setPresencaData(newData);
                            }}
                            className="text-xs"
                          >
                            Todos Presentes
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newData = { ...presencaData };
                              atletasNaLista.forEach(u => {
                                newData[u.id] = { ...newData[u.id], estado: 'ausente' };
                              });
                              setPresencaData(newData);
                            }}
                            className="text-xs"
                          >
                            Todos Ausentes
                          </Button>
                        </div>
                      </div>

                      {atletasDisponiveis.length > 0 && (
                        <div className="space-y-1 border-t pt-2">
                          <Label htmlFor="add-atleta" className="text-xs">Adicionar Atleta Manualmente</Label>
                          <Select
                            onValueChange={(userId) => {
                              if (userId) {
                                setPresencaData(prev => ({
                                  ...prev,
                                  [userId]: { estado: '' }
                                }));
                                toast.success('Atleta adicionado à lista');
                              }
                            }}
                          >
                            <SelectTrigger id="add-atleta" className="h-8 text-xs">
                              <SelectValue placeholder="Selecionar atleta..." />
                            </SelectTrigger>
                            <SelectContent>
                              {atletasDisponiveis.map(user => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.nome_completo} - {user.numero_socio}
                                  {user.escalao && user.escalao.length > 0 && ` (${getEscaloesNames(user.escalao, ageGroups || [])})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        {atletasNaLista.map(user => {
                          const userData = presencaData[user.id] || { estado: '' as EstadoPresenca | '' };
                          
                          return (
                            <Card key={user.id} className="p-3">
                              <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">
                                      {user.nome_completo}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {user.numero_socio}
                                      {user.escalao && user.escalao.length > 0 && (
                                        <> • {getEscaloesNames(user.escalao, ageGroups || [])}</>
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Select
                                      value={userData.estado || undefined}
                                      onValueChange={(value: EstadoPresenca | '') => 
                                        updatePresenca(user.id, 'estado', value)
                                      }
                                    >
                                      <SelectTrigger className="h-7 w-[130px] text-xs">
                                        <SelectValue placeholder="Classificar..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="presente">Presente</SelectItem>
                                        <SelectItem value="ausente">Ausente</SelectItem>
                                        <SelectItem value="justificado">Justificado</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newData = { ...presencaData };
                                        delete newData[user.id];
                                        setPresencaData(newData);
                                        toast.success('Atleta removido da lista');
                                      }}
                                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash size={14} />
                                    </Button>
                                  </div>
                                </div>

                                {(userData.estado === 'presente' || userData.estado === 'justificado') && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 border-t pt-3">
                                    {userData.estado === 'presente' && (
                                      <div className="space-y-1">
                                        <Label htmlFor={`hora-${user.id}`} className="text-xs">
                                          Hora de Chegada
                                        </Label>
                                        <Input
                                          id={`hora-${user.id}`}
                                          type="time"
                                          value={userData.hora_chegada || ''}
                                          onChange={(e) => 
                                            updatePresenca(user.id, 'hora_chegada', e.target.value)
                                          }
                                          className="h-8 text-xs"
                                        />
                                      </div>
                                    )}
                                    <div className="space-y-1 md:col-span-2">
                                      <Label htmlFor={`obs-${user.id}`} className="text-xs">
                                        {userData.estado === 'justificado' ? 'Justificação *' : 'Observações'}
                                      </Label>
                                      <Textarea
                                        id={`obs-${user.id}`}
                                        value={userData.observacoes || ''}
                                        onChange={(e) => 
                                          updatePresenca(user.id, 'observacoes', e.target.value)
                                        }
                                        placeholder={userData.estado === 'justificado' 
                                          ? "Ex: Doença, consulta médica, motivo familiar..." 
                                          : "Ex: Chegou atrasado, saiu mais cedo, etc."}
                                        rows={2}
                                        className="text-xs"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button onClick={handleSavePresencas} disabled={!selectedEvent}>
                <ClipboardText className="mr-2" size={16} />
                Guardar Presenças
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-2 sm:p-3">
        <div className="flex flex-col gap-2 sm:gap-3 md:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Pesquisar presenças..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 h-8 text-xs"
            />
          </div>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-full md:w-[200px] h-8 text-xs">
              <SelectValue placeholder="Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Eventos</SelectItem>
              {activeEvents.slice(0, 10).map(event => (
                <SelectItem key={event.id} value={event.id}>
                  {event.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={presenceFilter} onValueChange={setPresenceFilter}>
            <SelectTrigger className="w-full md:w-[160px] h-8 text-xs">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="presente">Presentes</SelectItem>
              <SelectItem value="ausente">Ausentes</SelectItem>
              <SelectItem value="justificado">Justificados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid gap-2 sm:gap-3">
        {activeEvents
          .filter(event => {
            if (hiddenEmptyTreinos.includes(event.id)) {
              return false;
            }
            const eventPresencas = (presencas || []).filter(p => p.evento_id === event.id);
            return event.tipo === 'treino' || eventPresencas.length > 0;
          })
          .map(event => {
            const eventPresencas = (presencas || []).filter(p => p.evento_id === event.id);
            const stats = getPresencaStats(event.id);
            const percentage = stats.total > 0 ? (stats.presentes / stats.total * 100).toFixed(0) : 0;
            const isExpanded = expandedCards[event.id] ?? false;

            return (
              <Card key={event.id} className="p-3">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{event.titulo}</h3>
                        {event.tipo === 'treino' && (
                          <Badge variant="outline" className="text-xs bg-green-50">
                            Treino
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.data_inicio), 'PPP', { locale: pt })}
                        {event.hora_inicio && ` às ${event.hora_inicio}`}
                      </p>
                      {eventPresencas.length === 0 && event.tipo === 'treino' && (
                        <p className="text-xs text-amber-600 mt-1">
                          Registo vazio - Adicione atletas para registar presenças
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(event.id)}
                        className="text-xs h-7 px-2 sm:px-3"
                      >
                        <ClipboardText className="sm:mr-1" size={14} />
                        <span className="hidden sm:inline">Registar</span>
                      </Button>
                      {stats.total > 0 && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleCardExpansion(event.id)}
                            className="text-xs h-7 px-2"
                            title={isExpanded ? "Minimizar lista" : "Expandir lista"}
                          >
                            {isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteEventPresencas(event.id)}
                            className="text-xs h-7 px-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                            title="Apagar todos os registos de presença deste evento"
                          >
                            <Trash size={14} />
                          </Button>
                        </>
                      )}
                      {eventPresencas.length === 0 && event.tipo === 'treino' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteEventPresencas(event.id)}
                          className="text-xs h-7 px-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                          title="Apagar registo de presença vazio"
                        >
                          <Trash size={14} />
                        </Button>
                      )}
                    </div>
                  </div>

                  {stats.total > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Total: {stats.presentes} presentes de {stats.total} atletas ({percentage}%)
                        </span>
                        <div className="flex gap-3">
                          <span className="flex items-center gap-1">
                            <CheckCircle size={14} className="text-green-600" />
                            {stats.presentes}
                          </span>
                          <span className="flex items-center gap-1">
                            <XCircle size={14} className="text-red-600" />
                            {stats.ausentes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Question size={14} className="text-amber-500" />
                            {stats.justificados}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {eventPresencas.length > 0 && isExpanded && (
                    <div className="border-t pt-2">
                      <ScrollArea className="max-h-[200px]">
                        <div className="space-y-1.5">
                          {eventPresencas
                            .filter(p => 
                              presenceFilter === 'todos' ||
                              (presenceFilter === 'presente' && p.estado === 'presente') ||
                              (presenceFilter === 'ausente' && p.estado === 'ausente') ||
                              (presenceFilter === 'justificado' && p.estado === 'justificado')
                            )
                            .map(p => {
                              const user = users?.find(u => u.id === p.user_id);
                              if (!user) return null;

                              return (
                                <div key={p.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{user.nome_completo}</p>
                                    {p.hora_chegada && (
                                      <p className="text-xs text-muted-foreground">
                                        Chegada: {p.hora_chegada}
                                      </p>
                                    )}
                                    {p.observacoes && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {p.observacoes}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex-shrink-0">
                                    {getEstadoIcon(p.estado)}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
      </div>

      {activeEvents.length === 0 && (
        <Card className="p-6 sm:p-8">
          <div className="text-center">
            <ClipboardText className="mx-auto text-muted-foreground mb-2 sm:mb-3" size={40} weight="thin" />
            <h3 className="font-semibold text-sm mb-0.5">Nenhum evento ativo</h3>
            <p className="text-muted-foreground text-xs">
              Crie eventos e convocatórias para registar presenças.
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
