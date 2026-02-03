<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EventsController extends Controller
{
    /**
     * GET /api/events
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::with(['eventType', 'costCenter', 'createdBy']);

        // Filter by type if provided
        if ($request->has('type')) {
            $query->where('type', $request->get('type'));
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('start_date', '>=', $request->get('start_date'));
        }
        if ($request->has('end_date')) {
            $query->where('start_date', '<=', $request->get('end_date'));
        }

        $events = $query->orderBy('start_date', 'desc')->get();
        
        return response()->json($events);
    }

    /**
     * POST /api/events
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_date' => 'nullable|date',
            'end_time' => 'nullable|date_format:H:i',
            'location' => 'nullable|string',
            'location_details' => 'nullable|string',
            'type' => 'required|string',
            'tipo_config_id' => 'nullable|uuid',
            'pool_type' => 'nullable|in:piscina_25m,piscina_50m,aguas_abertas',
            'visibility' => 'nullable|in:public,private,members',
            'eligible_age_groups' => 'nullable|array',
            'transport_required' => 'nullable|boolean',
            'status' => 'nullable|in:draft,published,cancelled,completed',
            'created_by' => 'nullable|uuid',
        ]);

        $event = Event::create($validated);
        
        return response()->json($event, 201);
    }

    /**
     * GET /api/events/{id}
     */
    public function show(string $id): JsonResponse
    {
        $event = Event::with(['eventType', 'costCenter', 'createdBy', 'participants'])->findOrFail($id);
        return response()->json($event);
    }

    /**
     * PUT /api/events/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'start_date' => 'sometimes|date',
            'start_time' => 'sometimes|date_format:H:i',
            'end_date' => 'sometimes|date',
            'end_time' => 'sometimes|date_format:H:i',
            'location' => 'sometimes|string',
            'type' => 'sometimes|string',
            'status' => 'sometimes|in:draft,published,cancelled,completed',
        ]);

        $event->update($validated);
        
        return response()->json($event);
    }

    /**
     * DELETE /api/events/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $event->delete();
        
        return response()->json(['message' => 'Event deleted successfully']);
    }
}
