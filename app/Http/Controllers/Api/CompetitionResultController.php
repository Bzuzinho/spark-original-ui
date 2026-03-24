<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sports\StoreResultRequest;
use App\Models\Competition;
use App\Models\Event;
use App\Models\Prova;
use App\Models\ProvaTipo;
use App\Models\Result;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class CompetitionResultController extends Controller
{
    /**
     * GET /api/desportivo/competition-results
     * Retorna todos os resultados de competições.
     */
    public function index(Request $request): JsonResponse
    {
        $competitionId = $request->query('competition_id');

        $results = Result::with(['athlete', 'prova.competition'])
            ->when($competitionId, fn ($query) => $query->whereHas('prova', fn ($provaQuery) => $provaQuery->where('competicao_id', $competitionId)))
            ->orderBy('created_at', 'desc')
            ->limit(500)
            ->get()
            ->map(fn($result) => [
                'id' => $result->id,
                'prova_id' => $result->prova_id,
                'competition_id' => $result->prova?->competition?->id,
                'competition_nome' => $result->prova?->competition?->nome,
                'user_id' => $result->user_id,
                'user_nome' => $result->athlete?->nome_completo,
                'prova' => trim(($result->prova?->distancia_m ?? 0) . 'm ' . ($result->prova?->estilo ?? '')),
                'tempo' => $result->tempo_oficial,
                'tempo_oficial' => $result->tempo_oficial,
                'colocacao' => $result->posicao,
                'posicao' => $result->posicao,
                'pontos_fina' => $result->pontos_fina,
                'desqualificado' => $result->desclassificado ?? false,
                'observacoes' => $result->observacoes,
                'created_at' => $result->created_at,
                'updated_at' => $result->updated_at,
            ]);

        return response()->json($results);
    }

    /**
     * GET /api/desportivo/competition-results/{id}
     * Retorna um resultado específico.
     */
    public function show(Result $competitionResult): JsonResponse
    {
        $result = $competitionResult->load(['athlete', 'prova.competition']);

        return response()->json([
            'id' => $result->id,
            'competition_id' => $result->prova?->competition?->id,
            'competition_nome' => $result->prova?->competition?->nome,
            'user_id' => $result->user_id,
            'user_nome' => $result->athlete?->nome_completo,
            'prova' => trim(($result->prova?->distancia_m ?? 0) . 'm ' . ($result->prova?->estilo ?? '')),
            'tempo_oficial' => $result->tempo_oficial,
            'posicao' => $result->posicao,
            'pontos_fina' => $result->pontos_fina,
            'desqualificado' => $result->desclassificado ?? false,
            'observacoes' => $result->observacoes,
            'created_at' => $result->created_at,
            'updated_at' => $result->updated_at,
        ]);
    }

    /**
     * POST /api/desportivo/competition-results
     * Cria um novo resultado de competição.
     */
    public function store(StoreResultRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $resolvedProvaId = $validated['prova_id'] ?? null;

        if (!$resolvedProvaId && !empty($validated['prova_tipo_id'])) {
            $competitionId = $this->resolveCompetitionId($validated['competition_id'] ?? null);

            if (!$competitionId) {
                throw ValidationException::withMessages([
                    'competition_id' => 'Competição inválida para criação do resultado.',
                ]);
            }

            $provaTipo = ProvaTipo::query()->findOrFail($validated['prova_tipo_id']);

            $resolvedProva = Prova::query()
                ->where('competicao_id', $competitionId)
                ->where('estilo', $provaTipo->nome)
                ->where('distancia_m', (int) $provaTipo->distancia)
                ->first();

            if (!$resolvedProva) {
                $resolvedProva = Prova::query()->create([
                    'competicao_id' => $competitionId,
                    'estilo' => $provaTipo->nome,
                    'distancia_m' => (int) $provaTipo->distancia,
                    'genero' => 'MISTO',
                    'escalao_id' => null,
                    'ordem_prova' => null,
                ]);
            }

            $resolvedProvaId = $resolvedProva->id;
        }

        if (!$resolvedProvaId) {
            throw ValidationException::withMessages([
                'prova_id' => 'Prova inválida para criação do resultado.',
            ]);
        }

        $result = Result::create([
            'prova_id' => $resolvedProvaId,
            'user_id' => $validated['user_id'],
            'tempo_oficial' => $validated['tempo_oficial'],
            'posicao' => $validated['posicao'] ?? null,
            'pontos_fina' => $validated['pontos_fina'] ?? null,
            'desclassificado' => $validated['desclassificado'] ?? false,
            'observacoes' => $validated['observacoes'] ?? null,
        ]);

        $result->load(['athlete', 'prova.competition']);

        return response()->json([
            'id' => $result->id,
            'prova_id' => $result->prova_id,
            'competition_id' => $result->prova?->competition?->id,
            'competition_nome' => $result->prova?->competition?->nome,
            'user_id' => $result->user_id,
            'user_nome' => $result->athlete?->nome_completo,
            'prova' => trim(($result->prova?->distancia_m ?? 0) . 'm ' . ($result->prova?->estilo ?? '')),
            'tempo_oficial' => $result->tempo_oficial,
            'posicao' => $result->posicao,
            'pontos_fina' => $result->pontos_fina,
            'desqualificado' => $result->desclassificado ?? false,
            'observacoes' => $result->observacoes,
            'created_at' => $result->created_at,
            'updated_at' => $result->updated_at,
        ], 201);
    }

    private function resolveCompetitionId(?string $competitionOrEventId): ?string
    {
        if (!$competitionOrEventId) {
            return null;
        }

        $competition = Competition::query()->find($competitionOrEventId);
        if ($competition) {
            return $competition->id;
        }

        $competitionByEvent = Competition::query()
            ->where('evento_id', $competitionOrEventId)
            ->first();

        if ($competitionByEvent) {
            return $competitionByEvent->id;
        }

        $event = Event::query()->find($competitionOrEventId);
        if (!$event) {
            return null;
        }

        $created = Competition::query()->create([
            'nome' => $event->titulo,
            'local' => $event->local,
            'data_inicio' => $event->data_inicio,
            'data_fim' => $event->data_fim,
            'tipo' => $event->tipo ?? 'prova',
            'evento_id' => $event->id,
        ]);

        return $created->id;
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
