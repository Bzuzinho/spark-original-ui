import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { CaisTrainingList } from '@/Components/Desportivo/components/cais/CaisTrainingList';
import { CaisTrainingCard } from '@/Components/Desportivo/components/cais/CaisTrainingCard';
import type { AgeGroup, Training, User } from './types';

interface TrainingWithEscaloes extends Training {
  escaloes?: string[] | null;
}

interface Props {
  trainings: TrainingWithEscaloes[];
  trainingOptions: any[];
  selectedTraining: TrainingWithEscaloes | null;
  users: User[];
  ageGroups: AgeGroup[];
}

type CaisStatus = 'presente' | 'ausente' | 'dispensado';

function getActiveAthletes(users: User[]): User[] {
  return users.filter((u) => {
    const tipos = u.tipo_membro ?? [];
    return u.estado === 'ativo' && tipos.includes('atleta');
  });
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
  users,
  ageGroups,
}: Props) {
  const ageGroupLabelById = useMemo<Record<string, string>>(
    () => ageGroups.reduce((acc, group) => {
      acc[group.id] = group.nome;
      return acc;
    }, {} as Record<string, string>),
    [ageGroups],
  );

  const [selectedTrainingIds, setSelectedTrainingIds] = useState<string[]>(
    selectedTraining ? [selectedTraining.id] : [],
  );

  const selectedTrainings = useMemo(
    () => trainings.filter((t) => selectedTrainingIds.includes(t.id)),
    [trainings, selectedTrainingIds],
  );

  const activeAthletes = useMemo(
    () => getActiveAthletes(users),
    [users],
  );

  const toggleTraining = (id: string) => {
    setSelectedTrainingIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const closeTraining = (id: string) => {
    setSelectedTrainingIds((prev) => prev.filter((t) => t !== id));
  };

  const updatePresence = (trainingId: string, userId: string, status: CaisStatus) => {
    const training = trainings.find((t) => t.id === trainingId);
    if (!training?.presencas_grupo) return;

    const presence = training.presencas_grupo.find((p) => p.user_id === userId);
    if (!presence) return;

    router.put(
      route('desportivo.presencas.update'),
      {
        presences: [{
          id: presence.id,
          legacy_presence_id: (presence as any).legacy_presence_id ?? null,
          status: toBackendStatus(status),
          distancia_realizada_m: (presence as any).distancia_realizada_m ?? null,
          notas: (presence as any).notas ?? null,
        }],
      },
      { preserveState: true, preserveScroll: true },
    );
  };

  const addAthleteToTraining = (trainingId: string, athleteId: string) => {
    router.post(
      route('desportivo.treino.atleta.add', { training: trainingId }),
      { user_id: athleteId },
      { preserveState: true, preserveScroll: true },
    );
  };

  const removeAthleteFromTraining = (trainingId: string, presenceId: string) => {
    const training = trainings.find((t) => t.id === trainingId);
    if (!training?.presencas_grupo) return;

    const presence = training.presencas_grupo.find((p) => p.id === presenceId);
    if (!presence) return;

    router.delete(
      route('desportivo.treino.atleta.remove', { training: trainingId, user: presence.user_id }),
      { preserveState: true, preserveScroll: true },
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Training List Sidebar */}
        <div className="lg:col-span-1">
          <CaisTrainingList
            trainings={trainings}
            selectedTrainingIds={selectedTrainingIds}
            onToggleTraining={toggleTraining}
            ageGroups={ageGroups}
          />
        </div>

        {/* Training Cards Grid */}
        <div className="lg:col-span-3">
          {selectedTrainings.length === 0 ? (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
              <p>Seleciona um ou mais treinos na lista ao lado para ver os detalhes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 auto-rows-max">
              {selectedTrainings.map((training) => {
                const trainingPresences = (training.presencas_grupo ?? []) as any[];

                return (
                  <div key={training.id} className="md:min-h-96">
                    <CaisTrainingCard
                      training={training}
                      athletes={activeAthletes}
                      presences={trainingPresences}
                      ageGroupLabelById={ageGroupLabelById}
                      onClose={() => closeTraining(training.id)}
                      onAddAthlete={(athleteId) => addAthleteToTraining(training.id, athleteId)}
                      onRemoveAthlete={(presenceId) => removeAthleteFromTraining(training.id, presenceId)}
                      onUpdatePresence={(userId, status) => updatePresence(training.id, userId, status)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}