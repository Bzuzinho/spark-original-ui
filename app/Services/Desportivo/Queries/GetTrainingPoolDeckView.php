<?php

namespace App\Services\Desportivo\Queries;

use App\Models\Training;
use App\Support\LegacySportsGuard;

class GetTrainingPoolDeckView
{
    public function __construct(private LegacySportsGuard $legacySportsGuard)
    {
    }

    public function __invoke(string $trainingId): array
    {
        $this->legacySportsGuard->assertTableAllowed('trainings', self::class);

        $training = Training::query()
            ->with([
                'season',
                'macrocycle',
                'mesocycle',
                'microcycle',
                'series',
                'athleteRecords.athlete',
                'metrics.trainingAthlete',
            ])
            ->findOrFail($trainingId);

        $groupedMetrics = $training->metrics
            ->groupBy(fn ($metric) => $metric->training_athlete_id ?: $metric->user_id)
            ->map(fn ($rows) => $rows->sortBy('ordem')->values())
            ->all();

        return [
            'training' => $training,
            'athlete_records' => $training->athleteRecords
                ->map(function ($record) use ($groupedMetrics) {
                    $metrics = $groupedMetrics[$record->id] ?? $groupedMetrics[$record->user_id] ?? collect();

                    return [
                        'id' => $record->id,
                        'user_id' => $record->user_id,
                        'athlete_name' => $record->athlete?->nome_completo,
                        'estado' => $record->estado,
                        'presente' => (bool) $record->presente,
                        'volume_real_m' => $record->volume_real_m,
                        'rpe' => $record->rpe,
                        'metrics' => collect($metrics)->map(fn ($metric) => [
                            'id' => $metric->id,
                            'ordem' => $metric->ordem,
                            'metrica' => $metric->metrica,
                            'valor' => $metric->valor,
                            'tempo' => $metric->tempo,
                            'recorded_at' => $metric->recorded_at,
                        ])->values(),
                    ];
                })
                ->values(),
        ];
    }
}
