import { useEffect, useRef } from 'react';
import { Event } from '@/lib/types';

export function useEventStatusSync(
  events: Event[] | undefined,
  setEvents: (updater: (current: Event[] | undefined) => Event[]) => void
) {
  const lastCheckRef = useRef<string>('');
  
  useEffect(() => {
    if (!events || events.length === 0) return;

    const checkAndUpdateEvents = () => {
      const now = new Date();

      let hasChanges = false;
      const changedEventIds: string[] = [];
      
      const updatedEvents = events.map(event => {
        if (event.estado === 'rascunho' || event.estado === 'cancelado') {
          return event;
        }

        const eventStartDateTime = new Date(event.data_inicio);
        if (event.hora_inicio) {
          const [hours, minutes] = event.hora_inicio.split(':');
          eventStartDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        } else {
          eventStartDateTime.setHours(0, 0, 0, 0);
        }

        let eventEndDateTime: Date;
        if (event.data_fim) {
          eventEndDateTime = new Date(event.data_fim);
          if (event.hora_fim) {
            const [hours, minutes] = event.hora_fim.split(':');
            eventEndDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
          } else {
            eventEndDateTime.setHours(23, 59, 59, 999);
          }
        } else {
          eventEndDateTime = new Date(eventStartDateTime);
          if (event.hora_fim) {
            const [hours, minutes] = event.hora_fim.split(':');
            eventEndDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
          } else {
            eventEndDateTime.setHours(23, 59, 59, 999);
          }
        }

        if (now > eventEndDateTime && event.estado !== 'concluido') {
          hasChanges = true;
          changedEventIds.push(`${event.id} -> concluido`);
          return {
            ...event,
            estado: 'concluido' as const,
            atualizado_em: new Date().toISOString(),
          };
        }

        if (now >= eventStartDateTime && now <= eventEndDateTime && event.estado !== 'em_curso') {
          hasChanges = true;
          changedEventIds.push(`${event.id} -> em_curso`);
          return {
            ...event,
            estado: 'em_curso' as const,
            atualizado_em: new Date().toISOString(),
          };
        }

        if (now < eventStartDateTime && event.estado !== 'agendado') {
          hasChanges = true;
          changedEventIds.push(`${event.id} -> agendado`);
          return {
            ...event,
            estado: 'agendado' as const,
            atualizado_em: new Date().toISOString(),
          };
        }

        return event;
      });

      const currentCheck = JSON.stringify(events.map(e => ({ id: e.id, estado: e.estado })));
      
      if (hasChanges && currentCheck !== lastCheckRef.current) {
        console.log('[EventStatusSync] Atualizando eventos:', changedEventIds);
        lastCheckRef.current = JSON.stringify(updatedEvents.map(e => ({ id: e.id, estado: e.estado })));
        setEvents(() => updatedEvents);
      }
    };

    checkAndUpdateEvents();

    const interval = setInterval(checkAndUpdateEvents, 60000);

    return () => clearInterval(interval);
  }, [events, setEvents]);
}
