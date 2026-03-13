<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sports\StoreTeamResultRequest;
use App\Models\TeamResult;
use Illuminate\Http\JsonResponse;

class TeamResultController extends Controller
{
    public function index(): JsonResponse
    {
        $rows = TeamResult::with('competition')
            ->orderByDesc('created_at')
            ->limit(500)
            ->get();

        return response()->json($rows);
    }

    public function store(StoreTeamResultRequest $request): JsonResponse
    {
        $teamResult = TeamResult::create($request->validated());

        return response()->json($teamResult, 201);
    }

    public function destroy(TeamResult $teamResult): JsonResponse
    {
        $teamResult->delete();

        return response()->json(['message' => 'Resultado de equipa removido']);
    }
}
