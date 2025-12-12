import { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Event, EventoTipo, CentroCusto } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CalendarBlank, CaretLeft, CaretRight, MapPin, Clock, Car, CurrencyEur, Pencil, Trash } from '@phosphor-icons/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AgeGroup {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
}

export function EventosCalendar() {
  const [events, setEvents] = useKV<Event[]>('club-events', []);
  const [ageGroups] = useKV<AgeGroup[]>('settings-age-groups', []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const getEscalaoName = (escalaoId: string): string => {
    const escalao = (ageGroups || []).find(ag => ag.id === escalaoId);
    return escalao?.name || escalaoId;
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const daysInCalendar = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const filteredEvents = useMemo(() => {
    return (events || []).filter(event => {
      const matchesType = typeFilter === 'todos' || event.tipo === typeFilter;
      return matchesType && event.estado !== 'cancelado';
    });
  }, [events, typeFilter]);

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => 
      isSameDay(new Date(event.data_inicio), day)
    );
  };

  const getEventTypeColor = (tipo: EventoTipo) => {
    switch (tipo) {
      case 'prova': return 'bg-red-500';
      case 'estagio': return 'bg-blue-500';
      case 'reuniao': return 'bg-yellow-500';
      case 'evento_interno': return 'bg-purple-500';
      case 'treino': return 'bg-green-500';
      case 'outro': return 'bg-gray-500';
      default: return 'bg-gray-500';
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

  const dayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const openDetailsDialog = (event: Event) => {
    setSelectedEvent(event);
    setDetailsDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Tem certeza que deseja eliminar este evento?')) {
      setEvents(current => (current || []).filter(e => e.id !== eventId));
      toast.success('Evento eliminado com sucesso!');
      setDetailsDialogOpen(false);
    }
  };

  const handleChangeStatus = (eventId: string, newStatus: Event['estado']) => {
    setEvents(current =>
      (current || []).map(e =>
        e.id === eventId ? { ...e, estado: newStatus, atualizado_em: new Date().toISOString() } : e
      )
    );
    toast.success(`Estado alterado para ${newStatus}`);
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
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="h-8"
            >
              <CaretLeft size={16} />
            </Button>
            <h2 className="text-base font-semibold min-w-[180px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: pt })}
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="h-8"
            >
              <CaretRight size={16} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
              className="h-8 text-xs ml-2"
            >
              Hoje
            </Button>
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <Card className="lg:col-span-2 p-3">
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              
              {daysInCalendar.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(day)}
                    className={`
                      relative min-h-[70px] sm:min-h-[85px] p-1 sm:p-1.5 rounded-lg transition-all flex flex-col
                      ${!isCurrentMonth ? 'opacity-40' : ''}
                      ${isToday ? 'bg-primary/10 border border-primary' : 'border border-border hover:bg-muted/50'}
                      ${isSelected ? 'ring-2 ring-primary' : ''}
                    `}
                  >
                    <div className="text-xs font-medium mb-1">
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      {dayEvents.slice(0, 2).map((event, eventIdx) => (
                        <div
                          key={eventIdx}
                          className={`${getEventTypeColor(event.tipo)} px-1 py-0.5 rounded text-white`}
                          title={`${event.titulo}${event.escaloes_elegiveis && event.escaloes_elegiveis.length > 0 ? ' - ' + event.escaloes_elegiveis.map(getEscalaoName).join(', ') : ''}`}
                        >
                          <div className="text-[9px] sm:text-[10px] font-medium truncate">
                            {getEventTypeLabel(event.tipo)}
                          </div>
                          {event.escaloes_elegiveis && event.escaloes_elegiveis.length > 0 && (
                            <div className="text-[8px] sm:text-[9px] opacity-90 truncate">
                              {event.escaloes_elegiveis.slice(0, 2).map(getEscalaoName).join(', ')}
                              {event.escaloes_elegiveis.length > 2 && '...'}
                            </div>
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-muted-foreground font-medium">
                          +{dayEvents.length - 2} mais
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">
                  {selectedDay ? format(selectedDay, 'PPP', { locale: pt }) : 'Selecione um dia'}
                </h3>
                {selectedDay && dayEvents.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {dayEvents.length} evento{dayEvents.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {selectedDay && dayEvents.length > 0 ? (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {dayEvents.map(event => (
                    <Card 
                      key={event.id} 
                      className="p-2.5 cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                      onClick={() => openDetailsDialog(event)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div
                            className={`${getEventTypeColor(event.tipo)} w-3 h-3 rounded-full mt-0.5 flex-shrink-0`}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2">{event.titulo}</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getEventTypeLabel(event.tipo)}
                              </Badge>
                              {event.escaloes_elegiveis && event.escaloes_elegiveis.length > 0 && (
                                event.escaloes_elegiveis.map((escalaoId, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {getEscalaoName(escalaoId)}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        {event.hora_inicio && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock size={12} />
                            <span>{event.hora_inicio}</span>
                          </div>
                        )}

                        {event.local && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin size={12} />
                            <span className="truncate">{event.local}</span>
                          </div>
                        )}

                        {event.descricao && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {event.descricao}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : selectedDay ? (
                <div className="text-center py-8">
                  <CalendarBlank className="mx-auto text-muted-foreground mb-2" size={32} weight="thin" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum evento neste dia
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarBlank className="mx-auto text-muted-foreground mb-2" size={32} weight="thin" />
                  <p className="text-sm text-muted-foreground">
                    Clique num dia para ver os eventos
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-3">
          <h3 className="font-semibold text-sm mb-2">Legenda</h3>
          <div className="flex flex-wrap gap-3">
            {['prova', 'estagio', 'reuniao', 'evento_interno', 'treino', 'outro'].map(tipo => (
              <div key={tipo} className="flex items-center gap-2">
                <div className={`${getEventTypeColor(tipo as EventoTipo)} w-3 h-3 rounded-full`} />
                <span className="text-xs">{getEventTypeLabel(tipo as EventoTipo)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{selectedEvent.titulo}</DialogTitle>
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
                  </div>

                  {selectedEvent.descricao && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Descrição</Label>
                      <p className="text-sm mt-1">{selectedEvent.descricao}</p>
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
                        {selectedEvent.escaloes_elegiveis.map(escalaoId => (
                          <Badge key={escalaoId} variant="outline" className="text-xs">
                            {getEscalaoName(escalaoId)}
                          </Badge>
                        ))}
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
                <Button size="sm" onClick={() => setDetailsDialogOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
