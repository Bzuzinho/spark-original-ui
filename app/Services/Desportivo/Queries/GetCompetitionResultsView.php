<?php

namespace App\Services\Desportivo\Queries;

use App\Models\Competition;
use App\Support\LegacySportsGuard;

class GetCompetitionResultsView
{
    public function __construct(private LegacySportsGuard $legacySportsGuard)
    {
    }

    public function __invoke(string $competitionId): array
    {
        $query = Competition::query()
            ->with([
                'provas.registrations.athlete',
                'provas.results.athlete',
                'teamResults',
            ])
            ->whereKey($competitionId);

        $this->legacySportsGuard->assertNoForbiddenTablesInSql($query->toSql(), self::class);

        $competition = $query->firstOrFail();

        return [
            'competition' => $competition,
            'provas' => $competition->provas,
            'team_results' => $competition->teamResults,
        ];
    }
}
