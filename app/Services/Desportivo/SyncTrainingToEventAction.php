<?php

namespace App\Services\Desportivo;

use App\Models\EventAttendance;
use App\Models\Training;
use App\Models\TrainingAthlete;
use Illuminate\Support\Facades\Log;

/**
 * @deprecated Legacy sync disabled after Sports canonical cutover
 *
 * Legacy sync disabled after Sports canonical cutover
 */
class SyncTrainingToEventAction
{
    /**
     * Sincroniza todos training_athletes de um treino para event_attendances
     * 
     * @param Training $training
     * @return int Número de attendances sincronizadas
     */
    public function execute(Training $training): int
    {
        Log::warning('SyncTrainingToEventAction is disabled (canonical Sports cutover).', [
            'training_id' => $training->id,
        ]);

        return 0;
    }

    /**
     * Sincroniza um único training_athlete para event_attendance
     * 
     * @param TrainingAthlete $trainingAthlete
     * @param string $eventoId
     * @return EventAttendance
     */
    public function syncSingleAthlete(TrainingAthlete $trainingAthlete, string $eventoId): EventAttendance
    {
        Log::warning('syncSingleAthlete skipped because SyncTrainingToEventAction is disabled.', [
            'training_athlete_id' => $trainingAthlete->id,
            'evento_id' => $eventoId,
        ]);

        return EventAttendance::make([
            'evento_id' => $eventoId,
            'user_id' => $trainingAthlete->user_id,
            'synced_from_training' => false,
        ]);
    }

    /**
     * Remover sincronização (delete event_attendance se training_athlete deletado)
     * 
     * @param string $eventoId
     * @param string $userId
     * @return bool
     */
    public function removeSyncedAttendance(string $eventoId, string $userId): bool
    {
        Log::warning('removeSyncedAttendance skipped because SyncTrainingToEventAction is disabled.', [
            'evento_id' => $eventoId,
            'user_id' => $userId,
        ]);

        return false;
    }
}
