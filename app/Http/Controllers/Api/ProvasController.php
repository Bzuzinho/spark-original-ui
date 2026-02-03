<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prova;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProvasController extends Controller
{
    public function index(): JsonResponse
    {
        $provas = Prova::with(['competition'])->orderBy('name')->get();
        return response()->json($provas);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'distance' => 'nullable|integer',
            'stroke' => 'nullable|string',
            'gender' => 'nullable|in:M,F,Mixed',
            'age_group' => 'nullable|string',
            'datetime' => 'nullable|date',
            'competition_id' => 'nullable|uuid',
        ]);

        $prova = Prova::create($validated);
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
            'name' => 'sometimes|string|max:255',
            'distance' => 'sometimes|integer',
            'stroke' => 'sometimes|string',
            'gender' => 'sometimes|in:M,F,Mixed',
        ]);

        $prova->update($validated);
        return response()->json($prova);
    }

    public function destroy(string $id): JsonResponse
    {
        Prova::findOrFail($id)->delete();
        return response()->json(['message' => 'Prova deleted successfully']);
    }
}
