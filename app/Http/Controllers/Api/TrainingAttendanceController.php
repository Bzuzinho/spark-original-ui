<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sports\UpdateTrainingAttendanceRequest;
use App\Models\TrainingAthlete;
use App\Services\Desportivo\Queries\GetTrainingDashboardSummary;
use Illuminate\Http\JsonResponse;

class TrainingAttendanceController extends Controller
{
    /**
     * GET /api/desportivo/trainings/{trainingId}/attendance
     * Retorna presenças de um treino.
     */
    public function index(string $trainingId): JsonResponse
    {
        $attendance = TrainingAthlete::where('treino_id', $trainingId)
            ->with('athlete')
            ->get()
            ->map(fn($record) => [
                'id' => $record->id,
                'user_id' => $record->user_id,
                'user_name' => $record->athlete?->nome_completo ?? 'Desconhecido',
                'presente' => $record->presente,
                'estado' => $record->estado,
                'volume_real_m' => $record->volume_real_m,
                'rpe' => $record->rpe,
                'observacoes_tecnicas' => $record->observacoes_tecnicas,
            ]);

        $summary = app(GetTrainingDashboardSummary::class)($trainingId);

        return response()->json([
            'attendance' => $attendance,
            'summary' => $summary,
        ]);
    }

    /**
     * PUT /api/desportivo/trainings/{trainingId}/attendance/{athleteId}
     * Marca presença ou atualiza estado de um atleta.
     */
    public function update(UpdateTrainingAttendanceRequest $request, string $trainingId, string $athleteId): JsonResponse
    {
        $validated = $request->validated();

        $record = TrainingAthlete::where('treino_id', $trainingId)
            ->where('user_id', $athleteId)
            ->firstOrFail();

        $record->update($validated);

        return response()->json([
            'message' => 'Presença atualizada',
            'data' => [
                'id' => $record->id,
                'user_id' => $record->user_id,
                'presente' => $record->presente,
                'estado' => $record->estado,
                'volume_real_m' => $record->volume_real_m,
                'rpe' => $record->rpe,
            ],
        ]);
    }

    /**
     * POST /api/desportivo/trainings/{trainingId}/attendance/mark-all
     * Marca todos presentes de uma vez.
     */
    public function markAllPresent(string $trainingId): JsonResponse
    {
        $count = TrainingAthlete::where('treino_id', $trainingId)
            ->update(['presente' => true, 'estado' => 'presente']);

        return response()->json(['message' => "Marcados $count atletas como presentes"]);
    }

    /**
     * POST /api/desportivo/trainings/{trainingId}/attendance/clear-all
     * Limpa todas as presenças de uma vez.
     */
    public function clearAll(string $trainingId): JsonResponse
    {
        $count = TrainingAthlete::where('treino_id', $trainingId)
            ->update(['presente' => false, 'estado' => 'ausente']);

        return response()->json(['message' => "Limpas $count presenças"]);
    }
}
