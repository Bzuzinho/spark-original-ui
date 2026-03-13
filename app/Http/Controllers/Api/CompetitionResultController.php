<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sports\StoreResultRequest;
use App\Models\Result;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CompetitionResultController extends Controller
{
    /**
     * GET /api/desportivo/competition-results
     * Retorna todos os resultados de competições.
     */
    public function index(): JsonResponse
    {
        $results = Result::with(['athlete', 'prova.competition'])
            ->orderBy('created_at', 'desc')
            ->limit(500)
            ->get()
            ->map(fn($result) => [
                'id' => $result->id,
                'competition_id' => $result->prova?->competition?->id,
                'competition_nome' => $result->prova?->competition?->nome,
                'user_id' => $result->user_id,
                'user_nome' => $result->athlete?->nome_completo,
                'prova' => trim(($result->prova?->distancia_m ?? 0) . 'm ' . ($result->prova?->estilo ?? '')),
                'tempo' => $result->tempo_oficial,
                'colocacao' => $result->posicao,
                'desqualificado' => $result->desclassificado ?? false,
            ]);

        return response()->json($results);
    }

    /**
     * POST /api/desportivo/competition-results
     * Cria um novo resultado de competição.
     */
    public function store(StoreResultRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = Result::create([
            'prova_id' => $validated['prova_id'],
            'user_id' => $validated['user_id'],
            'tempo_oficial' => $validated['tempo_oficial'],
            'posicao' => $validated['posicao'] ?? null,
            'pontos_fina' => $validated['pontos_fina'] ?? null,
            'desclassificado' => $validated['desclassificado'] ?? false,
            'observacoes' => $validated['observacoes'] ?? null,
        ]);

        return response()->json($result, 201);
    }

    /**
     * PUT /api/desportivo/competition-results/{id}
     * Atualiza um resultado.
     */
    public function update(Request $request, Result $competitionResult): JsonResponse
    {
        $validated = $request->validate([
            'tempo_oficial' => 'nullable|numeric|min:0',
            'posicao' => 'nullable|integer|min:1',
            'pontos_fina' => 'nullable|integer|min:0',
            'desclassificado' => 'nullable|boolean',
            'observacoes' => 'nullable|string',
        ]);

        $competitionResult->update($validated);

        return response()->json($competitionResult);
    }

    /**
     * DELETE /api/desportivo/competition-results/{id}
     * Elimina um resultado.
     */
    public function destroy(Result $competitionResult): JsonResponse
    {
        $competitionResult->delete();

        return response()->json(['message' => 'Resultado eliminado']);
    }
}
