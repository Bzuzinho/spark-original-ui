import { Suspense, lazy, useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { moduleTabbedContentClass, moduleTabsClass, moduleViewportClass } from '@/lib/module-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { ListChecks, CalendarBlank, ChartBar } from '@phosphor-icons/react';

const EventosDashboard = lazy(() => import('@/Components/Eventos/EventosDashboard'));
const EventosList = lazy(() => import('@/Components/Eventos/EventosList'));
const EventosCalendar = lazy(() => import('@/Components/Eventos/EventosCalendar'));
const EventosRelatorios = lazy(() => import('@/Components/Eventos/EventosRelatorios'));

function TabFallback() {
  return <div className="py-8 text-sm text-muted-foreground">A carregar...</div>;
}

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

interface CostCenter {
  id: string;
  nome: string;
  codigo?: string;
  ativo?: boolean;
}

interface AgeGroup {
  id: string;
  nome: string;
  idade_minima?: number;
  idade_maxima?: number;
  ativo?: boolean;
}

interface EventType {
  id: string;
  nome: string;
  visibilidade_default?: string;
  ativo?: boolean;
}

interface Props {
    eventos: Event[];
    stats: EventStats;
    users: User[];
  costCenters: CostCenter[];
  eventTypes: EventType[];
  ageGroups: AgeGroup[];
    convocations?: any[];
    attendances?: any[];
    results?: any[];
}

export default function EventosIndex({
  eventos = [],
  stats,
  users = [],
  costCenters = [],
  eventTypes = [],
  ageGroups = [],
  convocations = [],
  attendances: initialAttendances = [],
  results = [],
}: Props) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [attendances, setAttendances] = useState(initialAttendances);

  // Callback para atualizar attendances quando houver mudanças
  const handleAttendancesUpdate = (updatedAttendances: any[]) => {
    setAttendances(updatedAttendances);
  };

  return (
    <AuthenticatedLayout
      fullWidth
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

      <div className={moduleViewportClass}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className={moduleTabsClass}>
          <TabsList className="grid w-full shrink-0 h-9 grid-cols-4 p-1">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-1.5 px-1 py-1 text-xs"
            >
              <ChartBar size={16} className="flex-shrink-0" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="calendario"
              className="flex items-center gap-1.5 px-1 py-1 text-xs"
            >
              <CalendarBlank size={16} className="flex-shrink-0" />
              <span>Calendário</span>
            </TabsTrigger>
            <TabsTrigger
              value="eventos"
              className="flex items-center gap-1.5 px-1 py-1 text-xs"
            >
              <ListChecks size={16} className="flex-shrink-0" />
              <span>Eventos</span>
            </TabsTrigger>
            <TabsTrigger
              value="relatorios"
              className="flex items-center gap-1.5 px-1 py-1 text-xs"
            >
              <ChartBar size={16} className="flex-shrink-0" />
              <span>Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className={`${moduleTabbedContentClass} space-y-3`}>
            {activeTab === 'dashboard' ? (
              <Suspense fallback={<TabFallback />}>
                <EventosDashboard
                  events={eventos}
                  convocatorias={convocations}
                  attendances={attendances}
                />
              </Suspense>
            ) : null}
          </TabsContent>

          <TabsContent value="calendario" className={`${moduleTabbedContentClass} space-y-3`}>
            {activeTab === 'calendario' ? (
              <Suspense fallback={<TabFallback />}>
                <EventosCalendar
                  events={eventos}
                  ageGroups={ageGroups}
                  isActive={activeTab === 'calendario'}
                />
              </Suspense>
            ) : null}
          </TabsContent>

          <TabsContent value="eventos" className={`${moduleTabbedContentClass} space-y-3`}>
            {activeTab === 'eventos' ? (
              <Suspense fallback={<TabFallback />}>
                <EventosList
                  events={eventos}
                  users={users}
                  costCenters={costCenters}
                  eventTypes={eventTypes}
                  ageGroups={ageGroups}
                />
              </Suspense>
            ) : null}
          </TabsContent>

          <TabsContent value="relatorios" className={`${moduleTabbedContentClass} space-y-3`}>
            {activeTab === 'relatorios' ? (
              <Suspense fallback={<TabFallback />}>
                <EventosRelatorios
                  events={eventos}
                  convocatorias={convocations}
                  attendances={attendances}
                  results={results}
                  users={users}
                  ageGroups={ageGroups}
                />
              </Suspense>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
