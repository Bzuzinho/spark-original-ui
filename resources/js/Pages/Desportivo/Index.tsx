import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
  ChartBar,
  CalendarBlank,
  Trophy,
  ListChecks,
  Article,
} from '@phosphor-icons/react';
import {
  DesportivoDashboard,
  DesportivoPlaneamento,
  DesportivoTreinos,
  DesportivoCompeticoes,
  DesportivoRelatorios,
} from '@/Components/Desportivo';
import { ConvocatoriasList, PresencasList, EventosResultados } from '@/Components/Eventos';

interface Stats {
    athletesCount: number;
    trainings7Days: number;
    trainings30Days: number;
    km7Days: number;
    km30Days: number;
}

interface BasicItem {
    id: string;
}

interface Season extends BasicItem {
    nome: string;
    ano_temporada: string;
    estado: string;
    tipo: string;
    data_inicio: string;
    data_fim: string;
}

interface Macrocycle extends BasicItem {
    nome: string;
    tipo: string;
    data_inicio: string;
    data_fim: string;
    escalao?: string | null;
}

interface Training extends BasicItem {
    numero_treino?: string | null;
    data: string;
    hora_inicio?: string | null;
    hora_fim?: string | null;
    local?: string | null;
    tipo_treino: string;
    volume_planeado_m?: number | null;
    descricao_treino?: string | null;
}

interface PresenceRow extends BasicItem {
    user_id: string;
    nome_atleta: string;
    status: string;
    classificacao?: string | null;
    distancia_realizada_m?: number | null;
    notas?: string | null;
}

interface Competition extends BasicItem {
    titulo: string;
    data_inicio: string;
    local?: string;
    tipo: string;
}

interface EventResult {
    id: string;
    prova: string;
    tempo?: string | null;
    classificacao?: number | null;
    event?: { id: string; titulo: string };
    athlete?: { nome_completo: string };
}

interface AgeGroup {
  id: string;
  nome: string;
}

interface DesportivoProps {
  tab?: string;
  stats: Stats;
  alerts?: Array<{ title: string; message: string; type: string }>;
  upcomingCompetitions?: Array<{
    id: string;
    nome: string;
    data_inicio: string;
    num_atletas_inscritos: number;
  }>;
  seasons?: Season[];
  selectedSeason?: Season | null;
  macrocycles?: Macrocycle[];
  ageGroups?: AgeGroup[];
  trainings?: { data: Training[] };
  trainingOptions?: Array<{ id: string; numero_treino?: string; data: string }>;
  selectedTraining?: Training | null;
  presences?: PresenceRow[];
  competitions?: Competition[];
  results?: EventResult[];
  volumeByAthlete?: Array<{ nome_completo: string; total_m: number }>;
  reportAttendanceByGroup?: Array<{
    nome: string;
    percentagem: number;
    presentes: number;
    ausentes: number;
    total: number;
  }>;
  competitionStats?: Array<{
    id: string;
    titulo: string;
    data_inicio: string;
    participants_count: number;
  }>;
  financeVsSport?: {
    totalFinancialWeight: number;
    totalSportDistanceKm: number;
    costPerKm: number | null;
  };
  statusOptions?: string[];
  classificacaoOptions?: string[];
  eventos?: Event[];
  users?: User[];
  costCenters?: CostCenter[];
  eventTypes?: EventType[];
  convocations?: any[];
  attendances?: any[];
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

interface EventType {
  id: string;
  nome: string;
  visibilidade_default?: string;
  ativo?: boolean;
}

export default function DesportivoIndex({
  tab = 'dashboard',
  stats,
  alerts = [],
  upcomingCompetitions = [],
  seasons = [],
  selectedSeason = null,
  macrocycles = [],
  ageGroups = [],
  trainings = { data: [] },
  trainingOptions = [],
  selectedTraining = null,
  presences = [],
  competitions = [],
  results = [],
  volumeByAthlete = [],
  reportAttendanceByGroup = [],
  competitionStats = [],
  financeVsSport,
  statusOptions = ['presente', 'ausente'],
  classificacaoOptions = [],
  eventos = [],
  users = [],
  costCenters = [],
  eventTypes = [],
  convocations = [],
  attendances = [],
}: DesportivoProps) {
  const [activeTab, setActiveTab] = useState(tab);
  const [eventAttendances, setEventAttendances] = useState(attendances);

  return (
    <AuthenticatedLayout
      fullWidth
      header={
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
            Gestão Desportiva
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Planeamento de época, treinos, presenças, competições e relatórios
          </p>
        </div>
      }
    >
      <Head title="Gestão Desportiva" />

      <div className="w-full space-y-2 sm:space-y-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <TabsList className="grid w-full h-9 grid-cols-5 p-1">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-1.5 px-1 py-1 text-xs"
            >
              <ChartBar size={16} className="flex-shrink-0" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="planeamento"
              className="flex items-center gap-1.5 px-1 py-1 text-xs"
            >
              <CalendarBlank size={16} className="flex-shrink-0" />
              <span>Planeamento</span>
            </TabsTrigger>
            <TabsTrigger
              value="treinos"
              className="flex items-center gap-1.5 px-1 py-1 text-xs"
            >
              <ListChecks size={16} className="flex-shrink-0" />
              <span>Treinos</span>
            </TabsTrigger>
            <TabsTrigger
              value="competicoes"
              className="flex items-center gap-1.5 px-1 py-1 text-xs"
            >
              <Trophy size={16} className="flex-shrink-0" />
              <span>Competições</span>
            </TabsTrigger>
            <TabsTrigger
              value="relatorios"
              className="flex items-center gap-1.5 px-1 py-1 text-xs"
            >
              <Article size={16} className="flex-shrink-0" />
              <span>Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-3">
            <DesportivoDashboard
              stats={stats}
              alerts={alerts}
              upcomingCompetitions={upcomingCompetitions}
            />
          </TabsContent>

          <TabsContent value="planeamento" className="space-y-3">
            <DesportivoPlaneamento
              seasons={seasons}
              selectedSeason={selectedSeason}
              macrocycles={macrocycles}
            />
          </TabsContent>

          <TabsContent value="treinos" className="space-y-3">
            <Tabs defaultValue="treinos-lista" className="space-y-3">
              <TabsList className="grid w-full h-9 grid-cols-2 p-1">
                <TabsTrigger value="treinos-lista" className="text-xs">Treinos</TabsTrigger>
                <TabsTrigger value="treinos-presencas" className="text-xs">Presenças</TabsTrigger>
              </TabsList>

              <TabsContent value="treinos-lista" className="space-y-3">
                <DesportivoTreinos trainings={trainings} selectedSeason={selectedSeason} ageGroups={ageGroups} />
              </TabsContent>

              <TabsContent value="treinos-presencas" className="space-y-3">
                <PresencasList
                  events={eventos}
                  attendances={eventAttendances}
                  users={users}
                  ageGroups={ageGroups}
                  onUpdate={setEventAttendances}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="competicoes" className="space-y-3">
            <Tabs defaultValue="competicoes-lista" className="space-y-3">
              <TabsList className="grid w-full h-9 grid-cols-3 p-1">
                <TabsTrigger value="competicoes-lista" className="text-xs">Competições</TabsTrigger>
                <TabsTrigger value="competicoes-convocatorias" className="text-xs">Convocatórias</TabsTrigger>
                <TabsTrigger value="competicoes-resultados" className="text-xs">Resultados</TabsTrigger>
              </TabsList>

              <TabsContent value="competicoes-lista" className="space-y-3">
                <DesportivoCompeticoes competitions={competitions} results={results} />
              </TabsContent>

              <TabsContent value="competicoes-convocatorias" className="space-y-3">
                <ConvocatoriasList
                  events={eventos}
                  convocations={convocations}
                  users={users}
                  ageGroups={ageGroups}
                  costCenters={costCenters}
                />
              </TabsContent>

              <TabsContent value="competicoes-resultados" className="space-y-3">
                <EventosResultados
                  events={eventos}
                  results={results}
                  users={users}
                  ageGroups={ageGroups}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-3">
            <DesportivoRelatorios
              financeVsSport={financeVsSport}
              volumeByAthlete={volumeByAthlete}
              reportAttendanceByGroup={reportAttendanceByGroup}
              competitionStats={competitionStats}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
