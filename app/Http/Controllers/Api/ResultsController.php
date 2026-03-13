<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sports\StoreResultRequest;
use App\Models\Result;
use App\Services\Desportivo\Queries\GetAthletePerformanceHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ResultsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($request->filled('user_id')) {
            $history = app(GetAthletePerformanceHistory::class)($request->string('user_id'));
            return response()->json($history);
        }

        $query = Result::with(['athlete', 'prova.competition']);

        if ($request->filled('prova_id')) {
            $query->where('prova_id', $request->string('prova_id'));
        }

        if ($request->filled('competition_id')) {
            $query->whereHas('prova', fn ($provaQuery) => $provaQuery->where('competicao_id', $request->string('competition_id')));
        }

        $results = $query->orderByDesc('created_at')->get();
        return response()->json($results);
    }

    public function store(StoreResultRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = Result::create($validated);
        return response()->json($result, 201);
    }

    public function show(string $id): JsonResponse
    {
        $result = Result::with(['athlete', 'prova.competition'])->findOrFail($id);
        return response()->json($result);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $result = Result::findOrFail($id);
        
        $validated = $request->validate([
            'tempo_oficial' => 'sometimes|numeric|min:0',
            'posicao' => 'sometimes|nullable|integer|min:1',
            'pontos_fina' => 'sometimes|nullable|integer|min:0',
            'desclassificado' => 'sometimes|boolean',
            'observacoes' => 'sometimes|nullable|string',
        ]);

        $result->update($validated);
        return response()->json($result);
    }

    public function destroy(string $id): JsonResponse
    {
        Result::findOrFail($id)->delete();
        return response()->json(['message' => 'Result deleted successfully']);
    }
}
