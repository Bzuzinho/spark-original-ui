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
 *   dashboard | grupos | treinos | presencas | planeamento | competicoes | performance
 */

import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { moduleScrollableContentClass, moduleTabbedContentClass, moduleTabsClass, moduleViewportClass } from '@/lib/module-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
  ChartBar,
  UsersThree,
  CalendarBlank,
  CheckSquare,
  MapTrifold,
  Trophy,
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

import type {
  AgeGroup,
  AthleteOperationalRow,
  Competition,
  Event,
  EventResult,
  Macrocycle,
  MesocyclePlan,
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
  epoca_id?: string;
}

interface MacrocycleOption {
  id: string;
  nome: string;
  epoca_id?: string;
}

interface MesocycleOption {
  id: string;
  nome: string;
  macrociclo_id?: string;
  epoca_id?: string;
}

interface DesportivoProps {
  tab?: string;
  stats?: Stats;
  alerts?: Alert[];
  upcomingCompetitions?: UpcomingCompetition[];
  seasons?: Season[];
  selectedSeason?: Season | null;
  macrocycles?: Macrocycle[];
  macrocycleOptions?: MacrocycleOption[];
  mesocycles?: MesocyclePlan[];
  mesocycleOptions?: MesocycleOption[];
  microcycles?: MicrocycleOption[];
  microcycleOptions?: MicrocycleOption[];
  ageGroups?: AgeGroup[];
  trainingTypeOptions?: Array<{ id: string; nome: string }>;
  trainingZoneOptions?: Array<{ id: string; codigo: string; nome: string }>;
  trainings?: { data: Training[] };
  calendarTrainings?: Array<{ id: string; numero_treino?: string | null; data: string; macrocycle_id?: string | null; mesociclo_id?: string | null; microciclo_id?: string | null }>;
  trainingOptions?: TrainingOption[];
  selectedTraining?: Training | null;
  presences?: PresenceRow[];
  competitions?: Competition[];
  results?: EventResult[];
  teamResults?: TeamResult[];
  users?: User[];
  eventos?: Event[];
  costCenters?: Array<{ id: string; nome: string; codigo?: string; ativo?: boolean }>;
  eventTypes?: Array<{ id: string; nome: string; visibilidade_default?: string; ativo?: boolean }>;
  convocations?: any[];
  convocationGroups?: any[];
  provaTipos?: Array<{ id: string; nome: string }>;
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
  { value: 'performance',  label: 'Performance',  Icon: Lightning },
] as const;

type TabValue = typeof TABS[number]['value'];

const DEFAULT_STATS: Stats = {
  athletesCount: 0,
  trainings7Days: 0,
  trainings30Days: 0,
  km7Days: 0,
  km30Days: 0,
};

const TAB_ROUTES: Record<TabValue, () => string> = {
  dashboard: () => route('desportivo.index'),
  atletas: () => route('desportivo.index', { tab: 'atletas' }),
  treinos: () => route('desportivo.treinos'),
  planeamento: () => route('desportivo.planeamento'),
  cais: () => route('desportivo.cais'),
  competicoes: () => route('desportivo.competicoes'),
  performance: () => route('desportivo.relatorios'),
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function DesportivoIndex({
  tab = 'dashboard',
  stats = DEFAULT_STATS,
  alerts = [],
  upcomingCompetitions = [],
  seasons = [],
  selectedSeason = null,
  macrocycles = [],
  macrocycleOptions = [],
  mesocycles = [],
  mesocycleOptions = [],
  microcycles = [],
  microcycleOptions = [],
  ageGroups = [],
  trainingTypeOptions = [],
  trainingZoneOptions = [],
  trainings = { data: [] },
  calendarTrainings = [],
  trainingOptions = [],
  selectedTraining = null,
  presences = [],
  competitions = [],
  results = [],
  teamResults = [],
  users = [],
  eventos = [],
  costCenters = [],
  eventTypes = [],
  convocations = [],
  convocationGroups = [],
  provaTipos = [],
  statusOptions = ['presente', 'atrasado', 'falta', 'dispensado'],
  volumeByAthlete = [],
  athleteOperationalRows = [],
}: DesportivoProps) {
  const initialTab = (tab === 'presencas' ? 'cais' : tab === 'resultados' ? 'competicoes' : tab) as TabValue;
  const [isNavigatingToCais, setIsNavigatingToCais] = useState(false);
  const activeTab = TABS.some(({ value }) => value === initialTab) ? initialTab : 'dashboard';

  const safeUsers = Array.isArray(users) ? users : [];
  const safeTrainings = Array.isArray(trainings?.data) ? trainings.data : [];
  const safeCompetitions = Array.isArray(competitions) ? competitions : [];
  const safeResults = Array.isArray(results) ? results : [];
  const safeVolumeByAthlete = Array.isArray(volumeByAthlete) ? volumeByAthlete : [];

  const resolvedUsers = safeUsers;
  const resolvedTrainings = safeTrainings;
  const resolvedCompetitions = safeCompetitions;
  const resolvedResults = safeResults;
  const resolvedVolumeByAthlete = safeVolumeByAthlete;

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

  const handleTabChange = (value: string) => {
    const t = value as TabValue;

    if (t === activeTab) {
      return;
    }

    if (t === 'cais') {
      setIsNavigatingToCais(true);
    } else {
      setIsNavigatingToCais(false);
    }

    router.get(TAB_ROUTES[t](), {}, {
      preserveScroll: true,
      preserveState: false,
    });
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

      <div className={moduleViewportClass}>
        {isNavigatingToCais ? (
          <div className={moduleScrollableContentClass}>
            <div className="min-h-[240px] rounded-lg border border-dashed border-border bg-background" />
          </div>
        ) : (
          <>
        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className={moduleTabsClass}>

          <TabsList className="grid w-full shrink-0 grid-cols-4 sm:grid-cols-7 h-auto">
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

          <TabsContent value="dashboard" className={moduleTabbedContentClass}>
            <DashboardTab
              stats={stats}
              alerts={alerts}
              trainings={resolvedTrainings}
              upcomingCompetitions={upcomingCompetitions}
              competitions={resolvedCompetitions}
              eventos={eventos}
              ageGroups={ageGroups}
              users={resolvedUsers}
              volumeByAthlete={resolvedVolumeByAthlete}
            />
          </TabsContent>

          <TabsContent value="atletas" className={moduleTabbedContentClass}>
            <AthletesTab
              users={resolvedUsers}
              volumeByAthlete={resolvedVolumeByAthlete}
              athleteOperationalRows={athleteOperationalRows}
              ageGroups={ageGroups}
            />
          </TabsContent>

          <TabsContent value="treinos" className={moduleTabbedContentClass}>
            <TrainingsTab
              trainings={resolvedTrainings}
              seasons={seasons}
              ageGroups={ageGroups}
              users={resolvedUsers}
              trainingTypeOptions={resolvedTrainingTypeOptions}
              trainingZoneOptions={trainingZoneOptions}
              selectedSeasonId={selectedSeason?.id}
              macrocycles={macrocycleOptions.length > 0 ? macrocycleOptions : macrocycles}
              mesocycles={mesocycleOptions.length > 0 ? mesocycleOptions : mesocycles}
              microcycles={microcycleOptions.length > 0 ? microcycleOptions : microcycles}
              planningSeason={selectedSeason}
              planningMacrocycles={macrocycles}
              planningMesocycles={mesocycles}
              calendarTrainings={calendarTrainings}
            />
          </TabsContent>

          <TabsContent value="cais" className={moduleTabbedContentClass}>
            <PoolDeckTab
              trainings={resolvedTrainings}
              trainingOptions={resolvedTrainingOptions}
              selectedTraining={selectedTraining}
              users={resolvedUsers}
              ageGroups={ageGroups}
            />
          </TabsContent>

          <TabsContent value="planeamento" className={moduleTabbedContentClass}>
            <PlanningTab
              seasons={seasons}
              macrocycles={macrocycles}
              mesocycles={mesocycles}
              selectedSeasonId={selectedSeason?.id ?? null}
            />
          </TabsContent>

          <TabsContent value="competicoes" className={moduleTabbedContentClass}>
            <CompetitionsTab
              competitions={resolvedCompetitions}
              results={resolvedResults}
              teamResults={teamResults}
              users={resolvedUsers}
              eventos={eventos}
              ageGroups={ageGroups}
              costCenters={costCenters}
              eventTypes={eventTypes}
              convocations={convocations}
              convocationGroups={convocationGroups}
              provaTipos={provaTipos}
            />
          </TabsContent>

          <TabsContent value="performance" className={moduleTabbedContentClass}>
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
