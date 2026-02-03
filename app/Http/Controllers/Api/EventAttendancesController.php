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

        if ($request->has('event_id')) {
            $query->where('event_id', $request->get('event_id'));
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->get('user_id'));
        }

        $attendances = $query->orderBy('registered_at', 'desc')->get();
        return response()->json($attendances);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_id' => 'required|uuid|exists:events,id',
            'user_id' => 'required|uuid|exists:users,id',
            'status' => 'required|in:present,absent,excused,late',
            'arrival_time' => 'nullable|date',
            'notes' => 'nullable|string',
            'registered_by' => 'nullable|uuid|exists:users,id',
        ]);

        $validated['registered_at'] = now();
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
            'status' => 'sometimes|in:present,absent,excused,late',
            'arrival_time' => 'sometimes|date',
            'notes' => 'sometimes|string',
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
