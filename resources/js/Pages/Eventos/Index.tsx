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

      <div className="w-full space-y-2 sm:space-y-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <TabsList className="grid w-full h-9 grid-cols-7 p-1">
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
              value="convocatorias"
              className="flex items-center gap-1.5 px-1 py-1 text-xs"
            >
              <PaperPlaneTilt size={16} className="flex-shrink-0" />
              <span>Convocatórias</span>
            </TabsTrigger>
            <TabsTrigger
              value="presencas"
              className="flex items-center gap-1.5 px-1 py-1 text-xs"
            >
              <ClipboardText size={16} className="flex-shrink-0" />
              <span>Presenças</span>
            </TabsTrigger>
            <TabsTrigger
              value="resultados"
              className="flex items-center gap-1.5 px-1 py-1 text-xs"
            >
              <Trophy size={16} className="flex-shrink-0" />
              <span>Resultados</span>
            </TabsTrigger>
            <TabsTrigger
              value="relatorios"
              className="flex items-center gap-1.5 px-1 py-1 text-xs"
            >
              <ChartBar size={16} className="flex-shrink-0" />
              <span>Relatórios</span>
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
            <EventosList
              events={eventos}
              users={users}
              costCenters={costCenters}
              eventTypes={eventTypes}
              ageGroups={ageGroups}
            />
          </TabsContent>

          <TabsContent value="convocatorias" className="space-y-3">
            <ConvocatoriasList
              events={eventos}
              convocations={convocations}
              users={users}
              ageGroups={ageGroups}
              costCenters={costCenters}
            />
          </TabsContent>

          <TabsContent value="presencas" className="space-y-3">
            <PresencasList
              events={eventos}
              attendances={attendances}
              users={users}
              ageGroups={ageGroups}
              onUpdate={handleAttendancesUpdate}
            />
          </TabsContent>

          <TabsContent value="resultados" className="space-y-3">
            <EventosResultados
              events={eventos}
              results={results}
              users={users}
              ageGroups={ageGroups}
            />
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-3">
            <EventosRelatorios
              events={eventos}
              attendances={attendances}
              results={results}
              users={users}
              ageGroups={ageGroups}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
