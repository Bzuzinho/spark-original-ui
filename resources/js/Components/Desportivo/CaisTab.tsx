import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { CaisTrainingSelector } from '@/Components/Desportivo/components/cais/CaisTrainingSelector';
import { CaisTrainingSummary } from '@/Components/Desportivo/components/cais/CaisTrainingSummary';
import { CaisAthleteAttendanceList } from '@/Components/Desportivo/components/cais/CaisAthleteAttendanceList';
import type { AgeGroup, PresenceRow, Training, User } from './types';

interface TrainingOption {
  id: string;
  numero_treino?: string | null;
  data: string;
}

interface TrainingWithEscaloes extends Training {
  escaloes?: string[] | null;
}

interface Props {
  trainings: TrainingWithEscaloes[];
  trainingOptions: TrainingOption[];
  selectedTraining: TrainingWithEscaloes | null;
  presences: PresenceRow[];
  users: User[];
  ageGroups: AgeGroup[];
}

type CaisStatus = 'presente' | 'ausente' | 'dispensado';

function getEligibleAthletes(training: TrainingWithEscaloes | null, users: User[]): User[] {
  if (!training) return [];
  const active = users.filter((u) => {
    const tipos = u.tipo_membro ?? [];
    return u.estado === 'ativo' && tipos.includes('atleta');
  });
  const escaloes = training.escaloes ?? [];
  if (escaloes.length === 0) return active;
  return active.filter((u) => (u.escalao ?? []).some((e) => escaloes.includes(e)));
}

function toBackendStatus(status: CaisStatus): string {
  if (status === 'dispensado') {
    return 'justificado';
  }
  return status;
}

export function CaisTab({
  trainings,
  trainingOptions,
  selectedTraining,
  presences,
  users,
}: Props) {
  const initialCaisFromQuery = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('cais') === '1';
  const [quickMode, setQuickMode] = useState(initialCaisFromQuery);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>(
    selectedTraining?.id ?? trainingOptions[0]?.id ?? '',
  );

  const today = new Date().toISOString().slice(0, 10);
  const todayTrainingIds = trainingOptions.filter((t) => t.data === today).map((t) => t.id);

  const activeTraining =
    (trainings.find((t) => t.id === selectedTrainingId) ?? selectedTraining) as TrainingWithEscaloes | null;

  const eligibleAthletes = useMemo(
    () => getEligibleAthletes(activeTraining, users),
    [activeTraining, users],
  );

  const switchTraining = (id: string) => {
    setSelectedTrainingId(id);
    router.get(route('desportivo.presencas'), { training_id: id, cais: quickMode ? 1 : 0 }, { preserveState: false });
  };

  const updatePresence = (userId: string, status: CaisStatus) => {
    const row = presences.find((p) => p.user_id === userId);
    if (!row) return;

    router.put(
      route('desportivo.presencas.update'),
      {
        presences: [{
          id: row.id,
          legacy_presence_id: row.legacy_presence_id ?? null,
          status: toBackendStatus(status),
          distancia_realizada_m: row.distancia_realizada_m ?? null,
          notas: row.notas ?? null,
        }],
      },
      { preserveState: true, preserveScroll: true },
    );
  };

  return (
    <div className="space-y-3">
      <CaisTrainingSelector
        trainingOptions={trainingOptions}
        selectedTrainingId={selectedTrainingId}
        todayTrainingIds={todayTrainingIds}
        onSelectTraining={switchTraining}
        quickMode={quickMode}
        onToggleQuickMode={() => setQuickMode((v) => !v)}
      />

      <div className={`grid gap-3 ${quickMode ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
        <CaisTrainingSummary training={activeTraining} />
        <CaisAthleteAttendanceList
          training={activeTraining}
          athletes={eligibleAthletes}
          presences={presences}
          quickMode={quickMode}
          onUpdatePresence={updatePresence}
        />
      </div>
    </div>
  );
}