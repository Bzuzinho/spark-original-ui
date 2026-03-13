<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sports\StoreCompetitionRegistrationRequest;
use App\Models\CompetitionRegistration;
use Illuminate\Http\JsonResponse;

class CompetitionRegistrationController extends Controller
{
    public function index(): JsonResponse
    {
        $rows = CompetitionRegistration::with(['prova.competition', 'athlete'])
            ->orderByDesc('created_at')
            ->limit(500)
            ->get();

        return response()->json($rows);
    }

    public function store(StoreCompetitionRegistrationRequest $request): JsonResponse
    {
        $registration = CompetitionRegistration::create($request->validated());

        return response()->json($registration, 201);
    }

    public function destroy(CompetitionRegistration $competitionRegistration): JsonResponse
    {
        $competitionRegistration->delete();

        return response()->json(['message' => 'Inscricao removida']);
    }
}
