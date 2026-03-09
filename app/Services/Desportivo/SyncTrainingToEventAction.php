<?php

namespace App\Services\Desportivo;

use App\Models\EventAttendance;
use App\Models\Training;
use App\Models\TrainingAthlete;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Action: Sincronizar Training para Event Attendances
 * 
 * Responsabilidade:
 * - Sincronizar dados de training_athletes para event_attendances
 * - Manter event_attendances como espelho fiel de training_athletes
 * - Mapear estados entre as duas tabelas
 * - Criar/atualizar event_attendances conforme necessário
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
        if (!$training->evento_id) {
            Log::warning('Training has no associated event, cannot sync', [
                'training_id' => $training->id,
            ]);

            return 0;
        }

        $trainingAthletes = $training->athleteRecords;

        $syncedCount = 0;

        foreach ($trainingAthletes as $trainingAthlete) {
            $this->syncSingleAthlete($trainingAthlete, $training->evento_id);
            $syncedCount++;
        }

        Log::info('Training synced to event attendances', [
            'training_id' => $training->id,
            'event_id' => $training->evento_id,
            'synced_count' => $syncedCount,
        ]);

        return $syncedCount;
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
        // Mapear estado de training_athlete para event_attendance
        $mappedEstado = $this->mapEstado($trainingAthlete->estado);

        // Preparar dados de sync
        $attendanceData = [
            'estado' => $mappedEstado,
            'observacoes' => $this->buildObservacoes($trainingAthlete),
            'synced_from_training' => true,
            'training_athlete_id' => $trainingAthlete->id,
            'registado_por' => $trainingAthlete->registado_por 
                ?? $trainingAthlete->atualizado_por 
                ?? auth()->id(),
            'registado_em' => $trainingAthlete->registado_em ?? now(),
        ];

        // Upsert (create or update)
        $eventAttendance = EventAttendance::updateOrCreate(
            [
                'evento_id' => $eventoId,
                'user_id' => $trainingAthlete->user_id,
            ],
            $attendanceData
        );

        // Log de sincronização
        $this->logSync($trainingAthlete, $eventAttendance, 'synced');

        return $eventAttendance;
    }

    /**
     * Mapear estados de training_athlete para event_attendance
     * 
     * @param string|null $estado
     * @return string
     */
    private function mapEstado(?string $estado): string
    {
        return match ($estado) {
            'presente' => 'presente',
            'ausente' => 'ausente',
            'justificado' => 'justificado',
            'lesionado' => 'justificado',  // Lesionado = ausência justificada
            'doente' => 'justificado',     // Doente = ausência justificada
            'limitado' => 'presente',      // Limitado = presente mas com restrições
            default => 'ausente',
        };
    }

    /**
     * Construir observações agregadas para event_attendance
     * 
     * @param TrainingAthlete $trainingAthlete
     * @return string|null
     */
    private function buildObservacoes(TrainingAthlete $trainingAthlete): ?string
    {
        $parts = [];

        if ($trainingAthlete->estado === 'limitado') {
            $parts[] = '⚠️ Treino Limitado';
        }

        if ($trainingAthlete->volume_real_m) {
            $parts[] = "Volume: {$trainingAthlete->volume_real_m}m";
        }

        if ($trainingAthlete->rpe) {
            $parts[] = "RPE: {$trainingAthlete->rpe}/10";
        }

        if ($trainingAthlete->observacoes_tecnicas) {
            $parts[] = $trainingAthlete->observacoes_tecnicas;
        }

        return !empty($parts) ? implode(' | ', $parts) : null;
    }

    /**
     * Log de sincronização para audit trail
     * 
     * @param TrainingAthlete $trainingAthlete
     * @param EventAttendance $eventAttendance
     * @param string $action
     * @return void
     */
    private function logSync(TrainingAthlete $trainingAthlete, EventAttendance $eventAttendance, string $action): void
    {
        try {
            DB::table('training_sync_logs')->insert([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'source_table' => 'training_athletes',
                'source_id' => $trainingAthlete->id,
                'target_table' => 'event_attendances',
                'target_id' => $eventAttendance->id,
                'action' => $action,
                'status' => 'success',
                'payload_before' => json_encode($eventAttendance->getOriginal()),
                'payload_after' => json_encode($eventAttendance->getAttributes()),
                'triggered_by' => auth()->id(),
                'ip_address' => request()->ip(),
                'retry_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Não falhar a sincronização se log falhar
            Log::error('Failed to log training sync', [
                'error' => $e->getMessage(),
                'training_athlete_id' => $trainingAthlete->id,
            ]);
        }
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
        $deleted = EventAttendance::where('evento_id', $eventoId)
            ->where('user_id', $userId)
            ->where('synced_from_training', true)
            ->delete();

        if ($deleted) {
            Log::info('Synced event attendance removed', [
                'evento_id' => $eventoId,
                'user_id' => $userId,
            ]);
        }

        return (bool) $deleted;
    }
}
