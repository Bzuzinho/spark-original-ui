/**
 * Pages/Desportivo/Index.tsx
 *
 * Página principal do módulo "Desportivo".
 *
 * Fontes de dados (reutilizadas do backend existente):
 *   - trainings         → tabela `trainings`
 *   - trainingOptions   → tabela `trainings` (subset para selector)
 *   - selectedTraining  → trainer selecionado via ?training_id=
 *   - presences         → tabela `training_athletes`
 *   - seasons           → tabela `seasons`
 *   - macrocycles       → tabela `macrocycles`
 *   - ageGroups         → tabela `age_groups`
 *   - competitions      → tabela `competitions`
 *   - results           → tabela `results` com contexto em `provas`/`competitions`
 *   - users             → tabela `users`
 *   - volumeByAthlete   → query sobre `training_athletes`
 *   - stats             → queries agregadas
 *   - alerts            → calculados no controller
 *
 * Tabs:
 *   dashboard | grupos | treinos | presencas | planeamento | competicoes | resultados | performance
 */

import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
  ChartBar,
  UsersThree,
  CalendarBlank,
  CheckSquare,
  MapTrifold,
  Trophy,
  Medal,
  Lightning,
} from '@phosphor-icons/react';

import {
  AthletesTab,
  CompetitionsTab,
  DashboardTab,
  PlanningTab,
  PoolDeckTab,
  TrainingsTab,
  PerformanceTab,
} from '@/components/sports/tabs';
import { DesportivoResultadosTab }  from '@/Components/Desportivo/DesportivoResultadosTab';
import {
  useAthletes,
  useCompetitionResults,
  useCompetitions,
  usePerformance,
  useTrainings,
} from '@/hooks/sports';

import type {
  AgeGroup,
  AthleteOperationalRow,
  Competition,
  EventResult,
  Macrocycle,
  PresenceRow,
  Season,
  Stats,
  TeamResult,
  Training,
  User,
} from '@/types/sports';

// ─── Tipos da página (mapeados a partir do renderSportsPage do controller) ────

interface TrainingOption {
  id: string;
  numero_treino?: string | null;
  data: string;
}

interface Alert {
  title: string;
  message: string;
  type: string;
}

interface UpcomingCompetition {
  id: string;
  nome: string;
  data_inicio: string;
  num_atletas_inscritos: number;
}

interface VolumeRow {
  nome_completo: string;
  total_m: number;
}

interface MicrocycleOption {
  id: string;
  nome: string;
  mesociclo_id?: string;
  macrocycle_id?: string;
}

interface DesportivoProps {
  tab?: string;
  stats: Stats;
  alerts?: Alert[];
  upcomingCompetitions?: UpcomingCompetition[];
  seasons?: Season[];
  selectedSeason?: Season | null;
  macrocycles?: Macrocycle[];
  microcycles?: MicrocycleOption[];
  ageGroups?: AgeGroup[];
  trainingTypeOptions?: Array<{ id: string; nome: string }>;
  trainingZoneOptions?: Array<{ id: string; codigo: string; nome: string }>;
  trainings?: { data: Training[] };
  trainingOptions?: TrainingOption[];
  selectedTraining?: Training | null;
  presences?: PresenceRow[];
  competitions?: Competition[];
  results?: EventResult[];
  teamResults?: TeamResult[];
  users?: User[];
  statusOptions?: string[];
  classificacaoOptions?: string[];
  volumeByAthlete?: VolumeRow[];
  athleteOperationalRows?: AthleteOperationalRow[];
}

// ─── Tabs disponíveis ──────────────────────────────────────────────────────────

const TABS = [
  { value: 'dashboard',    label: 'Dashboard',    Icon: ChartBar },
  { value: 'atletas',      label: 'Atletas',      Icon: UsersThree },
  { value: 'treinos',      label: 'Treinos',      Icon: CalendarBlank },
  { value: 'planeamento',  label: 'Planeamento',  Icon: MapTrifold },
  { value: 'cais',         label: 'Cais',         Icon: CheckSquare },
  { value: 'competicoes',  label: 'Competições',  Icon: Trophy },
  { value: 'resultados',   label: 'Resultados',   Icon: Medal },
  { value: 'performance',  label: 'Performance',  Icon: Lightning },
] as const;

type TabValue = typeof TABS[number]['value'];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function DesportivoIndex({
  tab = 'dashboard',
  stats,
  alerts = [],
  upcomingCompetitions = [],
  seasons = [],
  selectedSeason = null,
  macrocycles = [],
  microcycles = [],
  ageGroups = [],
  trainingTypeOptions = [],
  trainingZoneOptions = [],
  trainings = { data: [] },
  trainingOptions = [],
  selectedTraining = null,
  presences = [],
  competitions = [],
  results = [],
  teamResults = [],
  users = [],
  statusOptions = ['presente', 'atrasado', 'falta', 'dispensado'],
  volumeByAthlete = [],
  athleteOperationalRows = [],
}: DesportivoProps) {
  const athletesQuery = useAthletes();
  const trainingsQuery = useTrainings();
  const competitionsQuery = useCompetitions();
  const competitionResultsQuery = useCompetitionResults();
  const performanceQuery = usePerformance();

  const safeUsers = Array.isArray(users) ? users : [];
  const safeTrainings = Array.isArray(trainings?.data) ? trainings.data : [];
  const safeCompetitions = Array.isArray(competitions) ? competitions : [];
  const safeResults = Array.isArray(results) ? results : [];
  const safeVolumeByAthlete = Array.isArray(volumeByAthlete) ? volumeByAthlete : [];

  const resolvedUsers = safeUsers.length > 0 ? safeUsers : athletesQuery.data;
  const resolvedTrainings = safeTrainings.length > 0 ? safeTrainings : trainingsQuery.data;
  const resolvedCompetitions = safeCompetitions.length > 0 ? safeCompetitions : competitionsQuery.data;
  const resolvedResults = safeResults.length > 0 ? safeResults : competitionResultsQuery.data;
  const resolvedVolumeByAthlete = safeVolumeByAthlete.length > 0
    ? safeVolumeByAthlete
    : performanceQuery.data.performance.map((row) => ({
        nome_completo: resolvedUsers.find((u) => u.id === row.athlete_id)?.nome_completo ?? row.athlete_id,
        total_m: row.volume_semanal_m,
      }));

  const resolvedTrainingOptions = trainingOptions.length > 0
    ? trainingOptions
    : resolvedTrainings.map((training) => ({
      id: training.id,
      numero_treino: training.numero_treino ?? null,
      data: training.data ?? '',
    }));

  const resolvedTrainingTypeOptions = trainingTypeOptions.length > 0
    ? trainingTypeOptions
    : Array.from(new Set(resolvedTrainings.map((training) => training.tipo_treino).filter(Boolean))).map((nome, idx) => ({
        id: `fallback-type-${idx}`,
        nome,
      }));

  const initialTab = (tab === 'presencas' ? 'cais' : tab) as TabValue;
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [isNavigatingToCais, setIsNavigatingToCais] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    setIsNavigatingToCais(false);
  }, [initialTab]);

  const loading =
    (safeUsers.length === 0 && athletesQuery.loading) ||
    (safeTrainings.length === 0 && trainingsQuery.loading) ||
    (safeCompetitions.length === 0 && competitionsQuery.loading) ||
    (safeResults.length === 0 && competitionResultsQuery.loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleTabChange = (value: string) => {
    const t = value as TabValue;

    // Sincronizar URL para que o refresh mantenha a tab correta
    if (t === 'cais') {
      setIsNavigatingToCais(true);
      router.get(route('desportivo.cais'));
      return;
    }

    setIsNavigatingToCais(false);
    setActiveTab(t);

    if (t !== activeTab) {
      router.get(route('desportivo.index'), {}, { preserveState: true, replace: true });
    }
  };

  return (
    <AuthenticatedLayout
      fullWidth
      header={
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Desportivo</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Sistema técnico de gestão desportiva: treinos, cais, competições e performance
          </p>
        </div>
      }
    >
      <Head title="Desportivo" />

      <div className="space-y-2 sm:space-y-3">
        {isNavigatingToCais ? (
          <div className="min-h-[240px] rounded-lg border border-dashed border-border bg-background" />
        ) : (
          <>
        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">

          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 h-auto mb-3">
            {TABS.map(({ value, label, Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-1.5 py-1.5 text-xs"
              >
                <Icon size={12} />
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <DashboardTab
              stats={stats}
              alerts={alerts}
              trainings={resolvedTrainings}
              upcomingCompetitions={upcomingCompetitions}
              competitions={resolvedCompetitions}
              users={resolvedUsers}
              volumeByAthlete={resolvedVolumeByAthlete}
              onOpenCais={(trainingId, modoCais) => {
                router.get(route('desportivo.cais'), { training_id: trainingId, cais: modoCais ? 1 : 0 });
              }}
            />
          </TabsContent>

          <TabsContent value="atletas" className="mt-0">
            <AthletesTab
              users={resolvedUsers}
              volumeByAthlete={resolvedVolumeByAthlete}
              athleteOperationalRows={athleteOperationalRows}
            />
          </TabsContent>

          <TabsContent value="treinos" className="mt-0">
            <TrainingsTab
              trainings={resolvedTrainings}
              ageGroups={ageGroups}
              users={resolvedUsers}
              trainingTypeOptions={resolvedTrainingTypeOptions}
              trainingZoneOptions={trainingZoneOptions}
              selectedSeasonId={selectedSeason?.id}
              macrocycles={macrocycles}
              microcycles={microcycles}
            />
          </TabsContent>

          <TabsContent value="cais" className="mt-0">
            <PoolDeckTab
              trainings={resolvedTrainings}
              trainingOptions={resolvedTrainingOptions}
              selectedTraining={selectedTraining}
              users={resolvedUsers}
              ageGroups={ageGroups}
            />
          </TabsContent>

          <TabsContent value="planeamento" className="mt-0">
            <PlanningTab
              seasons={seasons}
              macrocycles={macrocycles}
            />
          </TabsContent>

          <TabsContent value="competicoes" className="mt-0">
            <CompetitionsTab
              competitions={resolvedCompetitions}
              results={resolvedResults}
              users={resolvedUsers}
            />
          </TabsContent>

          <TabsContent value="resultados" className="mt-0">
            <DesportivoResultadosTab
              results={resolvedResults}
              teamResults={teamResults}
            />
          </TabsContent>

          <TabsContent value="performance" className="mt-0">
            <PerformanceTab
              users={resolvedUsers}
              volumeByAthlete={resolvedVolumeByAthlete}
            />
          </TabsContent>

        </Tabs>
          </>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
