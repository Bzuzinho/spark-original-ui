<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\Desportivo\Queries\GetCompetitionListSummary;
use App\Services\Desportivo\Queries\GetCompetitionResultsView;

class CompetitionController extends Controller
{
    /**
     * GET /api/desportivo/competitions
     * Retorna lista de competições.
     */
    public function index(): JsonResponse
    {
        $competitions = app(GetCompetitionListSummary::class)(50)
            ->map(fn($comp) => [
                'id' => $comp->id,
                'nome' => $comp->nome,
                'data_inicio' => $comp->data_inicio,
                'data_fim' => $comp->data_fim,
                'local' => $comp->local,
                'tipo_prova' => $comp->tipo,
                'total_provas' => (int) ($comp->total_provas ?? 0),
                'total_resultados' => (int) ($comp->total_resultados ?? 0),
                'total_inscritos' => (int) ($comp->total_inscritos ?? 0),
            ]);

        return response()->json($competitions);
    }

    /**
     * POST /api/desportivo/competitions
     * Cria uma nova competição.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'data_inicio' => 'required|date',
            'data_fim' => 'nullable|date|after_or_equal:data_inicio',
            'local' => 'nullable|string',
            'tipo_prova' => 'nullable|string',
        ]);

        $competition = Competition::create([
            'nome' => $validated['nome'],
            'data_inicio' => $validated['data_inicio'],
            'data_fim' => $validated['data_fim'] ?? null,
            'local' => $validated['local'] ?? 'N/A',
            'tipo' => $validated['tipo_prova'] ?? 'prova',
        ]);

        return response()->json($competition, 201);
    }

    /**
     * GET /api/desportivo/competitions/{id}
     * Retorna competição com resultados.
     */
    public function show(Competition $competition): JsonResponse
    {
        $view = app(GetCompetitionResultsView::class)($competition->id);
        $competition = $view['competition'];

        return response()->json([
            'id' => $competition->id,
            'nome' => $competition->nome,
            'data_inicio' => $competition->data_inicio,
            'data_fim' => $competition->data_fim,
            'local' => $competition->local,
            'tipo_prova' => $competition->tipo,
            'provas' => $view['provas'],
            'team_results' => $view['team_results'],
        ]);
    }

    /**
     * PUT /api/desportivo/competitions/{id}
     * Atualiza uma competição.
     */
    public function update(Request $request, Competition $competition): JsonResponse
    {
        $validated = $request->validate([
            'nome' => 'nullable|string|max:255',
            'data_inicio' => 'nullable|date',
            'data_fim' => 'nullable|date',
            'local' => 'nullable|string',
            'tipo_prova' => 'nullable|string',
        ]);

        $competition->update([
            'nome' => $validated['nome'] ?? $competition->nome,
            'data_inicio' => $validated['data_inicio'] ?? $competition->data_inicio,
            'data_fim' => $validated['data_fim'] ?? $competition->data_fim,
            'local' => $validated['local'] ?? $competition->local,
            'tipo' => $validated['tipo_prova'] ?? $competition->tipo,
        ]);

        return response()->json($competition);
    }

    /**
     * DELETE /api/desportivo/competitions/{id}
     * Elimina uma competição e seus resultados.
     */
    public function destroy(Competition $competition): JsonResponse
    {
        $competition->delete();

        return response()->json(['message' => 'Competição eliminada']);
    }
}
