<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EventAttendance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EventAttendancesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = EventAttendance::with(['event', 'user', 'registeredBy']);

        if ($request->has('evento_id')) {
            $query->where('evento_id', $request->get('evento_id'));
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->get('user_id'));
        }

        $attendances = $query->orderBy('registado_em', 'desc')->get();
        return response()->json($attendances);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'evento_id' => 'required|uuid|exists:events,id',
            'user_id' => 'required|uuid|exists:users,id',
            'estado' => 'required|in:presente,ausente,justificado',
            'hora_chegada' => 'nullable|date_format:H:i',
            'observacoes' => 'nullable|string',
            'registado_por' => 'nullable|uuid|exists:users,id',
            'registado_em' => 'nullable|date',
        ]);

        $validated['registado_por'] = $validated['registado_por'] ?? auth()->id();
        $validated['registado_em'] = $validated['registado_em'] ?? now();
        $attendance = EventAttendance::create($validated);
        
        return response()->json($attendance, 201);
    }

    public function show(string $id): JsonResponse
    {
        $attendance = EventAttendance::with(['event', 'user', 'registeredBy'])->findOrFail($id);
        return response()->json($attendance);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $attendance = EventAttendance::findOrFail($id);
        
        $validated = $request->validate([
            'estado' => 'sometimes|in:presente,ausente,justificado',
            'hora_chegada' => 'sometimes|date_format:H:i',
            'observacoes' => 'sometimes|string',
        ]);

        $attendance->update($validated);
        return response()->json($attendance);
    }

    public function destroy(string $id): JsonResponse
    {
        EventAttendance::findOrFail($id)->delete();
        return response()->json(['message' => 'Attendance record deleted successfully']);
    }
}
