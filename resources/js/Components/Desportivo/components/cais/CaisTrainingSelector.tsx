import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';

interface TrainingOption {
  id: string;
  numero_treino?: string | null;
  data: string;
}

interface Props {
  trainingOptions: TrainingOption[];
  selectedTrainingId: string;
  todayTrainingIds: string[];
  onSelectTraining: (id: string) => void;
  quickMode: boolean;
  onToggleQuickMode: () => void;
}

export function CaisTrainingSelector({
  trainingOptions,
  selectedTrainingId,
  todayTrainingIds,
  onSelectTraining,
  quickMode,
  onToggleQuickMode,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={selectedTrainingId} onValueChange={onSelectTraining}>
          <SelectTrigger className="w-64 text-xs h-8">
            <SelectValue placeholder="Selecionar treino do cais..." />
          </SelectTrigger>
          <SelectContent>
            {trainingOptions.map((t) => (
              <SelectItem key={t.id} value={t.id} className="text-xs">
                {t.data}{t.numero_treino ? ` · ${t.numero_treino}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant={quickMode ? 'default' : 'outline'} onClick={onToggleQuickMode}>
          {quickMode ? 'Modo normal' : 'Modo cais rápido'}
        </Button>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[11px] text-muted-foreground">Treinos de hoje:</span>
        {todayTrainingIds.length === 0 && (
          <Badge variant="outline" className="text-[10px]">Sem treinos hoje</Badge>
        )}
        {trainingOptions
          .filter((t) => todayTrainingIds.includes(t.id))
          .map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTraining(t.id)}
              className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                t.id === selectedTrainingId
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {t.numero_treino || t.data}
            </button>
          ))}
      </div>
    </div>
  );
}
