import { useMemo, useState } from 'react';
import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
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
import { CaretLeft, CaretRight, MapPin, Clock } from '@phosphor-icons/react';

interface Event {
  id: string;
  titulo: string;
  data_inicio: string;
  hora_inicio?: string;
  local: string;
  tipo: string;
  estado: string;
}

interface EventosCalendarProps {
  events: Event[];
}

export function EventosCalendar({ events = [] }: EventosCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [typeFilter, setTypeFilter] = useState('todos');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const daysInCalendar = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType = typeFilter === 'todos' || event.tipo === typeFilter;
      return matchesType && event.estado !== 'cancelado';
    });
  }, [events, typeFilter]);

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

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
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
