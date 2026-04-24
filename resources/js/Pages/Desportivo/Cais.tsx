import { Head, router, usePage } from '@inertiajs/react';
import { List } from '@phosphor-icons/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ClubMark } from '@/Components/ClubMark';
import { Button } from '@/Components/ui/button';
import { CaisTab } from '@/Components/Desportivo/CaisTab';
import { useClubSettings } from '@/hooks/useClubSettings';
import type { AgeGroup, Training, User } from '@/types/sports';

interface TrainingOption {
  id: string;
  numero_treino?: string | null;
  data: string;
}

interface CaisPageProps {
  trainings?: { data: Training[] };
  trainingOptions?: TrainingOption[];
  selectedTraining?: Training | null;
  users?: User[];
  ageGroups?: AgeGroup[];
}

export default function DesportivoCaisPage({
  trainings = { data: [] },
  trainingOptions = [],
  selectedTraining = null,
  users = [],
  ageGroups = [],
}: CaisPageProps) {
  usePage();
  const { clubLogoUrl, clubName, clubShortName } = useClubSettings();

  const safeTrainings = Array.isArray(trainings?.data) ? trainings.data : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const resolvedTrainingOptions = Array.isArray(trainingOptions) && trainingOptions.length > 0
    ? trainingOptions
    : safeTrainings.map((training) => ({
      id: training.id,
      numero_treino: training.numero_treino ?? null,
      data: training.data ?? '',
    }));

  return (
    <AuthenticatedLayout fullWidth collapseSidebarDesktop hideMobileHeader>
      <Head title="Modo Cais" />

      <div className="space-y-3 sm:space-y-4">
        <div className="w-full rounded-md border border-slate-300 bg-slate-200 px-3 py-2 sm:px-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => window.dispatchEvent(new Event('spark:open-sidebar'))}
                aria-label="Abrir menu lateral"
              >
                <List size={16} />
              </Button>
              <ClubMark
                logoUrl={clubLogoUrl}
                clubName={clubName}
                clubShortName={clubShortName}
                className="h-7 w-7 shrink-0 border border-slate-300 bg-white text-[10px]"
                imageClassName="h-7 w-7 shrink-0 object-contain"
              />
              <p className="text-sm sm:text-base font-semibold text-slate-800 truncate">Modo Cais</p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-8 px-3 text-xs sm:text-sm"
              onClick={() => router.get(route('desportivo.index'))}
            >
              Regressar
            </Button>
          </div>
        </div>

        <CaisTab
          trainings={safeTrainings as any}
          trainingOptions={resolvedTrainingOptions}
          selectedTraining={selectedTraining as any}
          users={safeUsers as any}
          ageGroups={ageGroups as any}
        />
      </div>
    </AuthenticatedLayout>
  );
}
