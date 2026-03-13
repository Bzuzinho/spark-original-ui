<?php

namespace App\Services\Desportivo\Queries;

use Illuminate\Support\Facades\DB;
use App\Support\LegacySportsGuard;

class GetTrainingDashboardSummary
{
    public function __construct(private LegacySportsGuard $legacySportsGuard)
    {
    }

    public function __invoke(string $trainingId): array
    {
        $query = DB::table('training_athletes')
            ->where('treino_id', $trainingId);

        $this->legacySportsGuard->assertNoForbiddenTablesInSql($query->toSql(), self::class);

        $rows = $query
            ->selectRaw('estado, COUNT(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');

        $volumeTotal = (int) DB::table('training_athletes')
            ->where('treino_id', $trainingId)
            ->sum(DB::raw('COALESCE(volume_real_m, 0)'));

        $dispensados = (int) (($rows['justificado'] ?? 0) + ($rows['lesionado'] ?? 0) + ($rows['doente'] ?? 0));

        return [
            'presentes' => (int) ($rows['presente'] ?? 0),
            'ausentes' => (int) ($rows['ausente'] ?? 0),
            'dispensados' => $dispensados,
            'volume_total' => $volumeTotal,
        ];
    }
}
