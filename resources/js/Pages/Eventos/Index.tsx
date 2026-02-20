import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { ListChecks, CalendarBlank, PaperPlaneTilt, ClipboardText, ChartBar, Trophy } from '@phosphor-icons/react';
import {
  EventosDashboard,
  EventosList,
  EventosCalendar,
  ConvocatoriasList,
  PresencasList,
  EventosResultados,
  EventosRelatorios,
} from '@/Components/Eventos';

interface Event {
    id: string;
    titulo: string;
    data_inicio: string;
    data_fim?: string;
    tipo: string;
    estado: string;
    local: string;
    descricao?: string;
    criado_por?: string;
    hora_inicio?: string;
    escaloes_elegiveis?: string[];
}

interface EventStats {
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
    activeConvocatorias: number;
}

interface User {
    id: string;
    nome_completo: string;
    email: string;
}

interface Props {
    eventos: Event[];
    stats: EventStats;
    users: User[];
    convocations?: any[];
    attendances?: any[];
    results?: any[];
}

export default function EventosIndex({
  eventos = [],
  stats,
  users = [],
  convocations = [],
  attendances = [],
  results = [],
}: Props) {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AuthenticatedLayout
      header={
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
            Gestão de Eventos
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Sistema completo de gestão de eventos, convocatórias e presenças
          </p>
        </div>
      }
    >
      <Head title="Gestão de Eventos" />

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl space-y-2 sm:space-y-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <TabsList className="grid grid-cols-7 w-full h-auto p-1">
            <TabsTrigger
              value="dashboard"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs"
            >
              <ChartBar size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="calendario"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs"
            >
              <CalendarBlank size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline">Calendário</span>
            </TabsTrigger>
            <TabsTrigger
              value="eventos"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs"
            >
              <ListChecks size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline">Eventos</span>
            </TabsTrigger>
            <TabsTrigger
              value="convocatorias"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs"
            >
              <PaperPlaneTilt size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline">Convocatórias</span>
            </TabsTrigger>
            <TabsTrigger
              value="presencas"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs"
            >
              <ClipboardText size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline">Presenças</span>
            </TabsTrigger>
            <TabsTrigger
              value="resultados"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs"
            >
              <Trophy size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline">Resultados</span>
            </TabsTrigger>
            <TabsTrigger
              value="relatorios"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs"
            >
              <ChartBar size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-3">
            <EventosDashboard
              events={eventos}
              convocatorias={convocations}
              attendances={attendances}
            />
          </TabsContent>

          <TabsContent value="calendario" className="space-y-3">
            <EventosCalendar events={eventos} />
          </TabsContent>

          <TabsContent value="eventos" className="space-y-3">
            <EventosList events={eventos} users={users} />
          </TabsContent>

          <TabsContent value="convocatorias" className="space-y-3">
            <ConvocatoriasList events={eventos} convocations={convocations} />
          </TabsContent>

          <TabsContent value="presencas" className="space-y-3">
            <PresencasList
              events={eventos}
              attendances={attendances}
              users={users}
            />
          </TabsContent>

          <TabsContent value="resultados" className="space-y-3">
            <EventosResultados
              events={eventos}
              results={results}
              users={users}
            />
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-3">
            <EventosRelatorios
              events={eventos}
              attendances={attendances}
              results={results}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
