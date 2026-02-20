<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EventResult;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EventResultsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = EventResult::with(['event', 'athlete', 'registeredBy']);

        // Filter by event
        if ($request->has('evento_id')) {
            $query->where('evento_id', $request->get('evento_id'));
        }

        // Filter by athlete
        if ($request->has('user_id')) {
            $query->where('user_id', $request->get('user_id'));
        }

        // Filter by prova
        if ($request->has('prova')) {
            $query->where('prova', 'like', '%' . $request->get('prova') . '%');
        }

        // Filter by escalao
        if ($request->has('escalao')) {
            $query->where('escalao', $request->get('escalao'));
        }

        // Filter by piscina
        if ($request->has('piscina')) {
            $query->where('piscina', $request->get('piscina'));
        }

        // Filter by epoca
        if ($request->has('epoca')) {
            $query->where('epoca', $request->get('epoca'));
        }

        // Filter by classificacao
        if ($request->has('classificacao')) {
            $query->where('classificacao', $request->get('classificacao'));
        }

        $results = $query->orderBy('registado_em', 'desc')->get();
        return response()->json($results);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'evento_id' => 'required|uuid|exists:events,id',
            'user_id' => 'required|uuid|exists:users,id',
            'prova' => 'required|string|max:255',
            'tempo' => 'nullable|string|max:255',
            'classificacao' => 'nullable|integer|min:1',
            'piscina' => 'nullable|in:25m,50m,aguas_abertas',
            'escalao' => 'nullable|string|max:255',
            'observacoes' => 'nullable|string',
            'epoca' => 'nullable|string|max:255',
            'registado_por' => 'nullable|uuid|exists:users,id',
            'registado_em' => 'nullable|date',
        ]);

        $validated['registado_por'] = $validated['registado_por'] ?? auth()->id();
        $validated['registado_em'] = $validated['registado_em'] ?? now();

        $result = EventResult::create($validated);
        
        return response()->json($result->load(['event', 'athlete', 'registeredBy']), 201);
    }

    public function show(string $id): JsonResponse
    {
        $result = EventResult::with(['event', 'athlete', 'registeredBy'])->findOrFail($id);
        return response()->json($result);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $result = EventResult::findOrFail($id);
        
        $validated = $request->validate([
            'evento_id' => 'sometimes|uuid|exists:events,id',
            'user_id' => 'sometimes|uuid|exists:users,id',
            'prova' => 'sometimes|string|max:255',
            'tempo' => 'nullable|string|max:255',
            'classificacao' => 'nullable|integer|min:1',
            'piscina' => 'nullable|in:25m,50m,aguas_abertas',
            'escalao' => 'nullable|string|max:255',
            'observacoes' => 'nullable|string',
            'epoca' => 'nullable|string|max:255',
        ]);

        $result->update($validated);
        return response()->json($result->load(['event', 'athlete', 'registeredBy']));
    }

    public function destroy(string $id): JsonResponse
    {
        EventResult::findOrFail($id)->delete();
        return response()->json(['message' => 'Resultado eliminado com sucesso']);
    }

    /**
     * Get statistics about event results
     */
    public function stats(Request $request): JsonResponse
    {
        $query = EventResult::query();

        if ($request->has('evento_id')) {
            $query->where('evento_id', $request->get('evento_id'));
        }

        if ($request->has('epoca')) {
            $query->where('epoca', $request->get('epoca'));
        }

        $totalResultados = $query->count();
        
        $podios = $query->whereIn('classificacao', [1, 2, 3])->count();
        
        $primeirosLugares = $query->where('classificacao', 1)->count();
        $segundosLugares = $query->where('classificacao', 2)->count();
        $terceirosLugares = $query->where('classificacao', 3)->count();

        $resultadosPorProva = EventResult::selectRaw('prova, count(*) as total')
            ->groupBy('prova')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        return response()->json([
            'total_resultados' => $totalResultados,
            'total_podios' => $podios,
            'primeiros_lugares' => $primeirosLugares,
            'segundos_lugares' => $segundosLugares,
            'terceiros_lugares' => $terceirosLugares,
            'resultados_por_prova' => $resultadosPorProva,
        ]);
    }
}
