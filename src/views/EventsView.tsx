import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventosList } from '@/components/eventos/EventosList';
import { ConvocatoriasList } from '@/components/eventos/ConvocatoriasList';
import { PresencasList } from '@/components/eventos/PresencasList';
import { EventosCalendar } from '@/components/eventos/EventosCalendar';
import { EventosTipos } from '@/components/eventos/EventosTipos';
import { EventosResultados } from '@/components/eventos/EventosResultados';
import { EventosRelatorios } from '@/components/eventos/EventosRelatorios';
import { ListChecks, CalendarBlank, PaperPlaneTilt, ClipboardText, Gear, ChartBar, Trophy } from '@phosphor-icons/react';
import { useEventStatusSync } from '@/hooks/use-event-status-sync';
import { Event } from '@/lib/types';

interface NavigationContext {
  eventId?: string;
  convocatoriaId?: string;
  tab?: string;
}

interface EventsViewProps {
  navigationContext?: NavigationContext;
  onClearContext?: () => void;
}

export function EventsView({ navigationContext, onClearContext }: EventsViewProps) {
  const [activeTab, setActiveTab] = useState('calendario');
  const [events, setEvents] = useKV<Event[]>('club-events', []);
  
  useEventStatusSync(events, setEvents);

  useEffect(() => {
    if (navigationContext?.tab) {
      setActiveTab(navigationContext.tab);
      if (onClearContext) {
        setTimeout(() => onClearContext(), 100);
      }
    }
  }, [navigationContext, onClearContext]);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl space-y-2 sm:space-y-3">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Gestão de Eventos</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Sistema completo de gestão de eventos, convocatórias e presenças
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="grid grid-cols-7 w-full h-auto p-1">
          <TabsTrigger value="calendario" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs">
            <CalendarBlank size={16} className="flex-shrink-0" />
            <span className="hidden sm:inline">Calendário</span>
          </TabsTrigger>
          <TabsTrigger value="eventos" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs">
            <ListChecks size={16} className="flex-shrink-0" />
            <span className="hidden sm:inline">Eventos</span>
          </TabsTrigger>
          <TabsTrigger value="convocatorias" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs">
            <PaperPlaneTilt size={16} className="flex-shrink-0" />
            <span className="hidden sm:inline">Convocatórias</span>
          </TabsTrigger>
          <TabsTrigger value="presencas" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs">
            <ClipboardText size={16} className="flex-shrink-0" />
            <span className="hidden sm:inline">Presenças</span>
          </TabsTrigger>
          <TabsTrigger value="resultados" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs">
            <Trophy size={16} className="flex-shrink-0" />
            <span className="hidden sm:inline">Resultados</span>
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs">
            <ChartBar size={16} className="flex-shrink-0" />
            <span className="hidden sm:inline">Relatórios</span>
          </TabsTrigger>
          <TabsTrigger value="configuracao" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs">
            <Gear size={16} className="flex-shrink-0" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendario" className="space-y-3">
          <EventosCalendar />
        </TabsContent>

        <TabsContent value="eventos" className="space-y-3">
          <EventosList />
        </TabsContent>

        <TabsContent value="convocatorias" className="space-y-3">
          <ConvocatoriasList selectedConvocatoriaId={navigationContext?.convocatoriaId} />
        </TabsContent>

        <TabsContent value="presencas" className="space-y-3">
          <PresencasList />
        </TabsContent>

        <TabsContent value="resultados" className="space-y-3">
          <EventosResultados />
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-3">
          <EventosRelatorios />
        </TabsContent>

        <TabsContent value="configuracao" className="space-y-3">
          <EventosTipos />
        </TabsContent>
      </Tabs>
    </div>
  );
}
