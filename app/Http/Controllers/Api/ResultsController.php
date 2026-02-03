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

        if ($request->has('athlete_id')) {
            $query->where('athlete_id', $request->get('athlete_id'));
        }

        if ($request->has('event_id')) {
            $query->where('event_id', $request->get('event_id'));
        }

        $results = $query->orderBy('date', 'desc')->get();
        return response()->json($results);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'athlete_id' => 'required|uuid|exists:users,id',
            'event_id' => 'nullable|uuid|exists:events,id',
            'event_name' => 'required|string',
            'race' => 'required|string',
            'location' => 'nullable|string',
            'date' => 'required|date',
            'pool' => 'nullable|in:piscina_25m,piscina_50m,aguas_abertas',
            'final_time' => 'required|string',
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
            'event_name' => 'sometimes|string',
            'race' => 'sometimes|string',
            'location' => 'sometimes|string',
            'date' => 'sometimes|date',
            'pool' => 'sometimes|in:piscina_25m,piscina_50m,aguas_abertas',
            'final_time' => 'sometimes|string',
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
