/**
 * Pages/Desportivo2/Index.tsx
 *
 * Página principal do módulo "Desportivo 2" — versão técnica avançada que
 * coexiste com o módulo Desportivo clássico (Pages/Desportivo/Index.tsx).
 *
 * Fontes de dados (reutilizadas do backend existente):
 *   - trainings         → tabela `trainings`
 *   - trainingOptions   → tabela `trainings` (subset para selector)
 *   - selectedTraining  → trainer selecionado via ?training_id=
 *   - presences         → tabela `training_athletes` (master) + `presences` (legacy)
 *   - seasons           → tabela `seasons`
 *   - macrocycles       → tabela `macrocycles`
 *   - ageGroups         → tabela `age_groups`
 *   - competitions      → tabela `events` (tipo='prova')
 *   - results           → tabela `event_results`
 *   - users             → tabela `users`
 *   - volumeByAthlete   → query sobre `presences`/`training_athletes`
 *   - stats             → queries agregadas
 *   - alerts            → calculados no controller
 *
 * Tabs:
 *   dashboard | grupos | treinos | presencas | planeamento | competicoes | resultados | performance
 */

import { useState } from 'react';
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
  Waves,
} from '@phosphor-icons/react';

import { Desportivo2DashboardTab }   from '@/Components/Desportivo2/Desportivo2DashboardTab';
import { Desportivo2AtletasTab }     from '@/Components/Desportivo2/Desportivo2AtletasTab';
import { Desportivo2TreinosTab }     from '@/Components/Desportivo2/Desportivo2TreinosTab';
import { CaisTab }                   from '@/Components/Desportivo2/CaisTab';
import { Desportivo2PlaneamentoTab } from '@/Components/Desportivo2/Desportivo2PlaneamentoTab';
import { Desportivo2CompeticoesTab } from '@/Components/Desportivo2/Desportivo2CompeticoesTab';
import { Desportivo2ResultadosTab }  from '@/Components/Desportivo2/Desportivo2ResultadosTab';
import { Desportivo2PerformanceTab } from '@/Components/Desportivo2/Desportivo2PerformanceTab';

import type {
  AgeGroup,
  AthleteOperationalRow,
  Competition,
  EventResult,
  Macrocycle,
  PresenceRow,
  Season,
  Stats,
  Training,
  User,
} from '@/Components/Desportivo2/types';

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

interface DesportivoV2Props {
  tab?: string;
  stats: Stats;
  alerts?: Alert[];
  upcomingCompetitions?: UpcomingCompetition[];
  seasons?: Season[];
  selectedSeason?: Season | null;
  macrocycles?: Macrocycle[];
  ageGroups?: AgeGroup[];
  trainings?: { data: Training[] };
  trainingOptions?: TrainingOption[];
  selectedTraining?: Training | null;
  presences?: PresenceRow[];
  competitions?: Competition[];
  results?: EventResult[];
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

export default function Desportivo2Index({
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
  users = [],
  statusOptions = ['presente', 'atrasado', 'falta', 'dispensado'],
  volumeByAthlete = [],
  athleteOperationalRows = [],
}: DesportivoV2Props) {
  const initialTab = (tab === 'presencas' ? 'cais' : tab) as TabValue;
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

  const handleTabChange = (value: string) => {
    const t = value as TabValue;
    setActiveTab(t);

    // Sincronizar URL para que o refresh mantenha a tab correta
    if (t === 'cais') {
      router.get(route('desportivo2.presencas'), {}, { preserveState: true, replace: true });
    } else if (t !== activeTab) {
      router.get(route('desportivo2.index'), {}, { preserveState: true, replace: true });
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="Desportivo 2" />

      <div className="px-4 py-4 max-w-7xl mx-auto space-y-3">

        {/* ── Cabeçalho ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Waves size={16} className="text-primary" />
              <h1 className="text-base font-semibold">Desportivo 2</h1>
              <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 font-medium">
                BETA
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Módulo técnico avançado — coexiste com o módulo Desportivo clássico
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.get(route('desportivo.index'))}
            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            ← Voltar ao Desportivo clássico
          </button>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>

          {/* Lista de tabs — scrollable em mobile */}
          <TabsList className="flex w-full overflow-x-auto gap-0.5 h-auto p-1 flex-nowrap justify-start">
            {TABS.map(({ value, label, Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-1.5 text-xs shrink-0 px-2.5 py-1.5"
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.slice(0, 3)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard" className="mt-3">
            <Desportivo2DashboardTab
              stats={stats}
              alerts={alerts}
              trainings={trainings.data}
              upcomingCompetitions={upcomingCompetitions}
              competitions={competitions}
              users={users}
              volumeByAthlete={volumeByAthlete}
              onOpenCais={(trainingId, modoCais) => {
                router.get(route('desportivo2.presencas'), { training_id: trainingId, cais: modoCais ? 1 : 0 });
              }}
            />
          </TabsContent>

          <TabsContent value="atletas" className="mt-3">
            <Desportivo2AtletasTab
              users={users}
              volumeByAthlete={volumeByAthlete}
              athleteOperationalRows={athleteOperationalRows}
            />
          </TabsContent>

          <TabsContent value="treinos" className="mt-3">
            <Desportivo2TreinosTab
              trainings={trainings.data}
              ageGroups={ageGroups}
              selectedSeasonId={selectedSeason?.id}
              competitions={competitions}
            />
          </TabsContent>

          <TabsContent value="cais" className="mt-3">
            <CaisTab
              trainings={trainings.data}
              trainingOptions={trainingOptions}
              selectedTraining={selectedTraining}
              presences={presences}
              users={users}
              ageGroups={ageGroups}
            />
          </TabsContent>

          <TabsContent value="planeamento" className="mt-3">
            <Desportivo2PlaneamentoTab
              seasons={seasons}
              macrocycles={macrocycles}
            />
          </TabsContent>

          <TabsContent value="competicoes" className="mt-3">
            <Desportivo2CompeticoesTab
              competitions={competitions}
              results={results}
              users={users}
            />
          </TabsContent>

          <TabsContent value="resultados" className="mt-3">
            <Desportivo2ResultadosTab
              results={results}
            />
          </TabsContent>

          <TabsContent value="performance" className="mt-3">
            <Desportivo2PerformanceTab
              users={users}
              volumeByAthlete={volumeByAthlete}
            />
          </TabsContent>

        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
