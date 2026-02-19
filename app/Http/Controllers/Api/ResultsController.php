<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResultProva;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ResultsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ResultProva::with(['atleta', 'evento']);

        if ($request->has('atleta_id')) {
            $query->where('atleta_id', $request->get('atleta_id'));
        }

        if ($request->has('evento_id')) {
            $query->where('evento_id', $request->get('evento_id'));
        }

        $results = $query->orderBy('data', 'desc')->get();
        return response()->json($results);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'atleta_id' => 'required|uuid|exists:users,id',
            'evento_id' => 'nullable|uuid|exists:events,id',
            'evento_nome' => 'nullable|string',
            'prova' => 'required|string',
            'local' => 'required|string',
            'data' => 'required|date',
            'piscina' => 'nullable|in:piscina_25m,piscina_50m,aguas_abertas',
            'tempo_final' => 'required|string',
        ]);

        $result = ResultProva::create($validated);
        return response()->json($result, 201);
    }

    public function show(string $id): JsonResponse
    {
        $result = ResultProva::with(['atleta', 'evento'])->findOrFail($id);
        return response()->json($result);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $result = ResultProva::findOrFail($id);
        
        $validated = $request->validate([
            'evento_nome' => 'sometimes|string',
            'prova' => 'sometimes|string',
            'local' => 'sometimes|string',
            'data' => 'sometimes|date',
            'piscina' => 'sometimes|in:piscina_25m,piscina_50m,aguas_abertas',
            'tempo_final' => 'sometimes|string',
        ]);

        $result->update($validated);
        return response()->json($result);
    }

    public function destroy(string $id): JsonResponse
    {
        ResultProva::findOrFail($id)->delete();
        return response()->json(['message' => 'Result deleted successfully']);
    }
}
