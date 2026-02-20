import { useMemo, useState } from 'react';
import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  format,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CaretLeft, CaretRight, MapPin, Clock, X } from '@phosphor-icons/react';

interface Event {
  id: string;
  titulo: string;
  data_inicio: string;
  hora_inicio?: string;
  local: string;
  tipo: string;
  estado: string;
  escaloes_elegiveis?: string[];
}

interface EventosCalendarProps {
  events: Event[];
}

export function EventosCalendar({ events = [] }: EventosCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [typeFilter, setTypeFilter] = useState('todos');
  const [escalaoFilter, setEscalaoFilter] = useState('todos');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const daysInCalendar = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Obter escalões únicos dos eventos
  const escaloes = useMemo(() => {
    const uniqueEscaloes = new Set<string>();
    events.forEach((event) => {
      event.escaloes_elegiveis?.forEach((escalao) => {
        uniqueEscaloes.add(escalao);
      });
    });
    return Array.from(uniqueEscaloes).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType = typeFilter === 'todos' || event.tipo === typeFilter;
      const matchesEscalao =
        escalaoFilter === 'todos' ||
        event.escaloes_elegiveis?.includes(escalaoFilter) ||
        false;
      return matchesType && matchesEscalao && event.estado !== 'cancelado';
    });
  }, [events, typeFilter, escalaoFilter]);

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event) =>
      isSameDay(new Date(event.data_inicio), day)
    );
  };

  const getEventTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'prova':
        return 'bg-yellow-100 text-yellow-700';
      case 'treino':
        return 'bg-blue-100 text-blue-700';
      case 'reuniao':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  const clearFilters = () => {
    setTypeFilter('todos');
    setEscalaoFilter('todos');
  };

  const hasActiveFilters = typeFilter !== 'todos' || escalaoFilter !== 'todos';

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Cabeçalho com navegação */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredEvents.length} evento(s) no mês
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <CaretLeft size={16} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              Hoje
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <CaretRight size={16} />
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 items-center flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="treino">Treino</SelectItem>
              <SelectItem value="prova">Prova</SelectItem>
              <SelectItem value="competicao">Competição</SelectItem>
              <SelectItem value="reuniao">Reunião</SelectItem>
              <SelectItem value="evento">Evento</SelectItem>
            </SelectContent>
          </Select>

          <Select value={escalaoFilter} onValueChange={setEscalaoFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Escalão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os escalões</SelectItem>
              {escaloes.map((escalao) => (
                <SelectItem key={escalao} value={escalao}>
                  {escalao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X size={14} className="mr-1" />
              Limpar filtros
            </Button>
          )}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {daysInCalendar.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-24 border rounded p-1 ${
                  isCurrentMonth ? 'bg-white' : 'bg-muted'
                } ${isToday ? 'border-primary' : 'border-border'}`}
              >
                <div
                  className={`text-xs font-medium mb-1 ${
                    isToday ? 'text-primary font-bold' : 'text-muted-foreground'
                  }`}
                >
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${getEventTypeColor(event.tipo)}`}
                      title={event.titulo}
                    >
                      {event.titulo}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayEvents.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
