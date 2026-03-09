<?php

namespace App\Observers;

use App\Events\TrainingAthleteUpdated;
use App\Models\TrainingAthlete;
use App\Services\Desportivo\SyncTrainingToEventAction;
use Illuminate\Support\Facades\Log;

/**
 * Observer: TrainingAthlete
 * 
 * Responsabilidade:
 * - Sincronizar automaticamente changes de training_athletes para event_attendances
 * - Manter espelho fiel entre as duas tabelas
 * - Log de erros de sincronização
 */
class TrainingAthleteObserver
{
    public function __construct(
        private SyncTrainingToEventAction $syncAction
    ) {}

    /**
     * Handle training_athlete "created" event
     */
    public function created(TrainingAthlete $trainingAthlete): void
    {
        $this->syncToEvent($trainingAthlete, 'created');
    }

    /**
     * Handle training_athlete "updated" event
     */
    public function updated(TrainingAthlete $trainingAthlete): void
    {
        // Apenas sincronizar se mudanças relevantes ocorreram
        if ($this->hasRelevantChanges($trainingAthlete)) {
            $this->syncToEvent($trainingAthlete, 'updated');
        }
    }

    /**
     * Handle training_athlete "deleted" event
     */
    public function deleted(TrainingAthlete $trainingAthlete): void
    {
        // Remover event_attendance correspondente (se synced)
        $training = $trainingAthlete->training;

        if ($training && $training->evento_id) {
            try {
                $this->syncAction->removeSyncedAttendance(
                    $training->evento_id,
                    $trainingAthlete->user_id
                );

                Log::info('Event attendance removed after training_athlete deletion', [
                    'training_athlete_id' => $trainingAthlete->id,
                    'evento_id' => $training->evento_id,
                    'user_id' => $trainingAthlete->user_id,
                ]);

            } catch (\Exception $e) {
                Log::error('Failed to remove event attendance after training_athlete deletion', [
                    'training_athlete_id' => $trainingAthlete->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Sincroniza training_athlete para event_attendance
     */
    private function syncToEvent(TrainingAthlete $trainingAthlete, string $action): void
    {
        $training = $trainingAthlete->training;

        if (!$training || !$training->evento_id) {
            Log::warning('Cannot sync training_athlete: no associated event', [
                'training_athlete_id' => $trainingAthlete->id,
                'training_id' => $trainingAthlete->treino_id,
            ]);

            return;
        }

        try {
            $this->syncAction->syncSingleAthlete($trainingAthlete, $training->evento_id);

            Log::debug('Training athlete synced to event attendance', [
                'training_athlete_id' => $trainingAthlete->id,
                'evento_id' => $training->evento_id,
                'action' => $action,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to sync training_athlete to event_attendance', [
                'training_athlete_id' => $trainingAthlete->id,
                'evento_id' => $training->evento_id,
                'action' => $action,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Não propagar exceção para não bloquear a operação principal
            // Log de erro é suficiente
        }
    }

    /**
     * Verifica se houve mudanças relevantes que requerem sync
     */
    private function hasRelevantChanges(TrainingAthlete $trainingAthlete): bool
    {
        $relevantFields = [
            'presente',
            'estado',
            'volume_real_m',
            'rpe',
            'observacoes_tecnicas',
        ];

        foreach ($relevantFields as $field) {
            if ($trainingAthlete->wasChanged($field)) {
                return true;
            }
        }

        return false;
    }
}
