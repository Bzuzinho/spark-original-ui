<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prova;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProvasController extends Controller
{
    public function index(): JsonResponse
    {
        $provas = Prova::with(['competition'])->orderBy('ordem_prova')->orderBy('estilo')->get();
        return response()->json($provas);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'competicao_id' => ['nullable', 'uuid', 'exists:competitions,id'],
            'competition_id' => ['nullable', 'uuid', 'exists:competitions,id'],
            'estilo' => ['required', 'string', 'max:30'],
            'distancia_m' => ['required', 'integer', 'min:1'],
            'genero' => ['required', Rule::in(['M', 'F', 'MISTO', 'Mixed'])],
            'escalao_id' => ['nullable', 'uuid', 'exists:age_groups,id'],
            'ordem_prova' => ['nullable', 'integer', 'min:1'],
        ]);

        $prova = Prova::create([
            'competicao_id' => $validated['competicao_id'] ?? $validated['competition_id'] ?? null,
            'estilo' => $validated['estilo'],
            'distancia_m' => $validated['distancia_m'],
            'genero' => $validated['genero'] === 'Mixed' ? 'MISTO' : $validated['genero'],
            'escalao_id' => $validated['escalao_id'] ?? null,
            'ordem_prova' => $validated['ordem_prova'] ?? null,
        ]);
        return response()->json($prova, 201);
    }

    public function show(string $id): JsonResponse
    {
        $prova = Prova::with(['competition', 'results'])->findOrFail($id);
        return response()->json($prova);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $prova = Prova::findOrFail($id);
        
        $validated = $request->validate([
            'competicao_id' => ['sometimes', 'nullable', 'uuid', 'exists:competitions,id'],
            'competition_id' => ['sometimes', 'nullable', 'uuid', 'exists:competitions,id'],
            'estilo' => ['sometimes', 'string', 'max:30'],
            'distancia_m' => ['sometimes', 'integer', 'min:1'],
            'genero' => ['sometimes', Rule::in(['M', 'F', 'MISTO', 'Mixed'])],
            'escalao_id' => ['sometimes', 'nullable', 'uuid', 'exists:age_groups,id'],
            'ordem_prova' => ['sometimes', 'nullable', 'integer', 'min:1'],
        ]);

        $prova->update([
            'competicao_id' => $validated['competicao_id'] ?? $validated['competition_id'] ?? $prova->competicao_id,
            'estilo' => $validated['estilo'] ?? $prova->estilo,
            'distancia_m' => $validated['distancia_m'] ?? $prova->distancia_m,
            'genero' => isset($validated['genero']) ? ($validated['genero'] === 'Mixed' ? 'MISTO' : $validated['genero']) : $prova->genero,
            'escalao_id' => $validated['escalao_id'] ?? $prova->escalao_id,
            'ordem_prova' => $validated['ordem_prova'] ?? $prova->ordem_prova,
        ]);
        return response()->json($prova);
    }

    public function destroy(string $id): JsonResponse
    {
        Prova::findOrFail($id)->delete();
        return response()->json(['message' => 'Prova deleted successfully']);
    }
}
