<?php

namespace App\Services\Desportivo\Queries;

use App\Models\Result;
use App\Support\LegacySportsGuard;

class GetAthletePerformanceHistory
{
    public function __construct(private LegacySportsGuard $legacySportsGuard)
    {
    }

    public function __invoke(string $userId)
    {
        $query = Result::query()
            ->with(['prova.competition'])
            ->where('user_id', $userId)
            ->join('provas', 'results.prova_id', '=', 'provas.id')
            ->join('competitions', 'provas.competicao_id', '=', 'competitions.id')
            ->orderBy('competitions.data_inicio')
            ->orderBy('results.created_at')
            ->select('results.*');

        $this->legacySportsGuard->assertNoForbiddenTablesInSql($query->toSql(), self::class);

        return $query->get()->map(function ($result) {
            return [
                'id' => $result->id,
                'competition_id' => $result->prova?->competition?->id,
                'competition_nome' => $result->prova?->competition?->nome,
                'competition_data' => $result->prova?->competition?->data_inicio,
                'prova_id' => $result->prova_id,
                'prova' => trim(($result->prova?->distancia_m ?? 0) . 'm ' . ($result->prova?->estilo ?? '')),
                'tempo_oficial' => $result->tempo_oficial,
                'posicao' => $result->posicao,
                'pontos_fina' => $result->pontos_fina,
                'desclassificado' => (bool) $result->desclassificado,
                'created_at' => $result->created_at,
            ];
        })->values();
    }
}
