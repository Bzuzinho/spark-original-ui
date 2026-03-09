<?php

namespace App\Services\Desportivo;

use App\Models\Presence;
use App\Models\TrainingAthlete;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Action: Migrar Dados Legacy de Presences
 * 
 * Responsabilidade:
 * - Migrar registos antigos de 'presences' para 'training_athletes'
 * - Detectar e resolver conflitos de dados
 * - Marcar presences como migrados
 * - Gerar relatório de migração
 */
class MigrateLegacyPresencesAction
{
    /**
     * Executa migração de presences legacy
     * 
     * @param bool $dryRun Se true, apenas simula sem gravar
     * @return array Relatório de migração
     */
    public function execute(bool $dryRun = false): array
    {
        $report = [
            'dry_run' => $dryRun,
            'started_at' => now()->toIso8601String(),
            'started_at_ts' => now(),
            'total_presences' => 0,
            'already_migrated' => 0,
            'migrated' => 0,
            'conflicts' => 0,
            'errors' => 0,
            'skipped' => 0,
            'error_details' => [],
            'conflict_details' => [],
        ];

        // Buscar presences legacy que ainda não foram migrados
        $legacyPresences = Presence::where('is_legacy', true)
            ->whereNull('migrated_to_training_athlete_id')
            ->whereNotNull('treino_id')
            ->orderBy('created_at')
            ->get();

        $report['total_presences'] = $legacyPresences->count();

        if ($legacyPresences->isEmpty()) {
            Log::info('No legacy presences to migrate');
            $report['finished_at'] = now()->toIso8601String();
            $report['duration_seconds'] = (int) abs($report['started_at_ts']->diffInSeconds(now(), false));
            unset($report['started_at_ts']);
            return $report;
        }

        foreach ($legacyPresences as $presence) {
            try {
                $result = $this->migratePresence($presence, $dryRun);

                match ($result['status']) {
                    'migrated' => $report['migrated']++,
                    'conflict' => $report['conflicts']++,
                    'skipped' => $report['skipped']++,
                    default => null,
                };

                if ($result['status'] === 'conflict') {
                    $report['conflict_details'][] = $result;
                }

            } catch (\Exception $e) {
                $report['errors']++;
                $report['error_details'][] = [
                    'presence_id' => $presence->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ];

                Log::error('Failed to migrate presence', [
                    'presence_id' => $presence->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $report['finished_at'] = now()->toIso8601String();
        $report['duration_seconds'] = (int) abs($report['started_at_ts']->diffInSeconds(now(), false));
        unset($report['started_at_ts']);

        Log::info('Legacy presences migration completed', $report);

        return $report;
    }

    /**
     * Migra um presence individual
     * 
     * @param Presence $presence
     * @param bool $dryRun
     * @return array Status da migração
     */
    private function migratePresence(Presence $presence, bool $dryRun): array
    {
        // Verificar se já existe training_athlete para este treino + user
        $existingTrainingAthlete = TrainingAthlete::where('treino_id', $presence->treino_id)
            ->where('user_id', $presence->user_id)
            ->first();

        if ($existingTrainingAthlete) {
            // Conflito: training_athlete já existe
            return $this->handleConflict($presence, $existingTrainingAthlete, $dryRun);
        }

        // Não existe: criar novo training_athlete
        return $this->createFromPresence($presence, $dryRun);
    }

    /**
     * Cria training_athlete a partir de presence
     * 
     * @param Presence $presence
     * @param bool $dryRun
     * @return array
     */
    private function createFromPresence(Presence $presence, bool $dryRun): array
    {
        $athleteData = [
            'treino_id' => $presence->treino_id,
            'user_id' => $presence->user_id,
            'presente' => $presence->presente,
            'estado' => $this->mapPresenceStatusToAthleteEstado($presence),
            'volume_real_m' => $presence->distancia_realizada_m ?? null,
            'rpe' => null, // presences não tem RPE
            'observacoes_tecnicas' => $presence->notas ?? $presence->justificacao ?? null,
            'registado_por' => null, // presences não rastreia quem criou
            'registado_em' => $presence->created_at,
        ];

        if (!$dryRun) {
            $trainingAthlete = TrainingAthlete::create($athleteData);

            // Marcar presence como migrado
            $presence->update([
                'migrated_to_training_athlete_id' => $trainingAthlete->id,
            ]);

            return [
                'status' => 'migrated',
                'presence_id' => $presence->id,
                'training_athlete_id' => $trainingAthlete->id,
                'action' => 'created',
            ];
        }

        return [
            'status' => 'migrated',
            'presence_id' => $presence->id,
            'training_athlete_id' => 'DRY_RUN',
            'action' => 'would_create',
            'data' => $athleteData,
        ];
    }

    /**
     * Trata conflito quando training_athlete já existe
     * 
     * @param Presence $presence
     * @param TrainingAthlete $existingTrainingAthlete
     * @param bool $dryRun
     * @return array
     */
    private function handleConflict(Presence $presence, TrainingAthlete $existingTrainingAthlete, bool $dryRun): array
    {
        // Estratégia: Manter training_athlete existente (é a fonte de verdade mais recente)
        // Apenas marcar presence como migrado
        $conflict = [
            'status' => 'conflict',
            'presence_id' => $presence->id,
            'training_athlete_id' => $existingTrainingAthlete->id,
            'action' => 'kept_existing',
            'presence_data' => [
                'presente' => $presence->presente,
                'status' => $presence->status,
                'distancia' => $presence->distancia_realizada_m,
            ],
            'training_athlete_data' => [
                'presente' => $existingTrainingAthlete->presente,
                'estado' => $existingTrainingAthlete->estado,
                'volume_real_m' => $existingTrainingAthlete->volume_real_m,
            ],
        ];

        if (!$dryRun) {
            // Marcar presence como migrado (aponta para training_athlete existente)
            $presence->update([
                'migrated_to_training_athlete_id' => $existingTrainingAthlete->id,
            ]);
        }

        return $conflict;
    }

    /**
     * Mapear 'status' de presence para 'estado' de training_athlete
     * 
     * @param Presence $presence
     * @return string
     */
    private function mapPresenceStatusToAthleteEstado(Presence $presence): string
    {
        if ($presence->presente) {
            return 'presente';
        }

        // Mapear status textual de presence (se existir)
        return match ($presence->status) {
            'justificado', 'atestado_medico' => 'justificado',
            'presente' => 'presente',
            'ausente' => 'ausente',
            default => 'ausente',
        };
    }

    /**
     * Gerar relatório em formato legível
     * 
     * @param array $report
     * @return string
     */
    public function generateReportText(array $report): string
    {
        $text = "=================  RELATÓRIO DE MIGRAÇÃO - PRESENCES LEGACY ================\n\n";
        $text .= "Modo: " . ($report['dry_run'] ? "DRY RUN (simulação)" : "PRODUCTION (real)") . "\n";
        $text .= "Iniciado em: {$report['started_at']}\n";
        $text .= "Finalizado em: {$report['finished_at']}\n";
        $text .= "Duração: {$report['duration_seconds']} segundos\n\n";

        $text .= "--- ESTATÍSTICAS ---\n";
        $text .= "Total de presences legacy: {$report['total_presences']}\n";
        $text .= "✅ Migrados com sucesso: {$report['migrated']}\n";
        $text .= "⚠️  Conflitos (manteve existente): {$report['conflicts']}\n";
        $text .= "❌ Erros: {$report['errors']}\n";
        $text .= "⏭️  Skipped: {$report['skipped']}\n\n";

        if (!empty($report['conflict_details'])) {
            $text .= "--- DETALHES DE CONFLITOS ---\n";
            foreach ($report['conflict_details'] as $idx => $conflict) {
                $text .= "Conflito #" . ($idx + 1) . ":\n";
                $text .= "  Presence ID: {$conflict['presence_id']}\n";
                $text .= "  Training Athlete ID: {$conflict['training_athlete_id']}\n";
                $text .= "  Ação: {$conflict['action']}\n";
                $text .= "\n";
            }
        }

        if (!empty($report['error_details'])) {
            $text .= "--- DETALHES DE ERROS ---\n";
            foreach ($report['error_details'] as $idx => $error) {
                $text .= "Erro #" . ($idx + 1) . ":\n";
                $text .= "  Presence ID: {$error['presence_id']}\n";
                $text .= "  Mensagem: {$error['error']}\n";
                $text .= "\n";
            }
        }

        $text .= "================================================================================\n";

        return $text;
    }
}
