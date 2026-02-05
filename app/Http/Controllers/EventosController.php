<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use App\Models\EventType;
use App\Models\EventConvocation;
use App\Models\EventAttendance;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EventosController extends Controller
{
    public function index(): Response
    {
        // Get stats
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        
        $stats = [
            'upcomingEvents' => Event::where('start_date', '>=', $now)
                ->where('status', '!=', 'cancelado')
                ->count(),
            'monthParticipants' => EventConvocation::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count(),
            'completedEvents' => Event::where('status', 'concluido')
                ->whereYear('start_date', $now->year)
                ->count(),
        ];

        return Inertia::render('Eventos/Index', [
            'events' => Event::with(['creator', 'convocations.athlete', 'attendances.athlete'])
                ->orderBy('start_date', 'desc')
                ->get(),
            'stats' => $stats,
            'users' => User::where('status', 'ativo')->get(['id', 'nome_completo', 'user_type']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Eventos/Create', [
            'eventTypes' => EventType::where('ativo', true)->get(),
            'users' => User::where('estado', 'ativo')->get(),
        ]);
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['created_by'] = auth()->id();
        
        // Set default estado if not provided
        if (!isset($data['status'])) {
            $data['status'] = 'rascunho';
        }
        
        $event = Event::create($data);

        return redirect()->route('events.index')
            ->with('success', 'Evento criado com sucesso!');
    }

    public function show(Event $evento): Response
    {
        return Inertia::render('Eventos/Show', [
            'event' => $evento->load([
                'creator',
                'eventType',
                'convocations.user',
                'attendances.user',
                'results',
            ]),
        ]);
    }

    public function edit(Event $evento): Response
    {
        return Inertia::render('Eventos/Edit', [
            'event' => $evento->load(['eventType']),
            'eventTypes' => EventType::where('ativo', true)->get(),
            'users' => User::where('estado', 'ativo')->get(),
        ]);
    }

    public function update(UpdateEventRequest $request, Event $evento): RedirectResponse
    {
        $evento->update($request->validated());

        return redirect()->route('events.index')
            ->with('success', 'Evento atualizado com sucesso!');
    }

    public function destroy(Event $evento): RedirectResponse
    {
        $evento->delete();

        return redirect()->route('events.index')
            ->with('success', 'Evento eliminado com sucesso!');
    }

    /**
     * Add a participant to an event
     */
    public function addParticipant(Request $request, Event $evento): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'status' => 'nullable|in:confirmado,pendente,ausente',
            'notes' => 'nullable|string',
        ]);

        $status = $request->input('status', 'pendente');

        // Check if participant already exists
        $existing = EventConvocation::where('event_id', $evento->id)
            ->where('user_id', $request->user_id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Participante já adicionado a este evento',
            ], 422);
        }

        $convocation = EventConvocation::create([
            'event_id' => $evento->id,
            'user_id' => $request->user_id,
            'convocation_date' => now(),
            'confirmation_status' => $status,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Participante adicionado com sucesso',
            'convocation' => $convocation->load('athlete'),
        ]);
    }

    /**
     * Remove a participant from an event
     */
    public function removeParticipant(Event $evento, User $user): JsonResponse
    {
        $convocation = EventConvocation::where('event_id', $evento->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$convocation) {
            return response()->json([
                'message' => 'Participante não encontrado neste evento',
            ], 404);
        }

        $convocation->delete();

        return response()->json([
            'message' => 'Participante removido com sucesso',
        ]);
    }

    /**
     * Update participant status
     */
    public function updateParticipantStatus(Request $request, Event $evento, User $user): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:confirmado,pendente,ausente',
            'notes' => 'nullable|string',
        ]);

        $convocation = EventConvocation::where('event_id', $evento->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$convocation) {
            return response()->json([
                'message' => 'Participante não encontrado neste evento',
            ], 404);
        }

        $convocation->update([
            'confirmation_status' => $request->status,
            'notes' => $request->notes,
            'response_date' => now(),
        ]);

        return response()->json([
            'message' => 'Estado do participante atualizado com sucesso',
            'convocation' => $convocation->load('athlete'),
        ]);
    }

    /**
     * Get event stats
     */
    public function stats(): JsonResponse
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        
        return response()->json([
            'upcomingEvents' => Event::where('start_date', '>=', $now)
                ->where('status', '!=', 'cancelado')
                ->count(),
            'monthParticipants' => EventConvocation::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count(),
            'completedEvents' => Event::where('status', 'concluido')
                ->whereYear('start_date', $now->year)
                ->count(),
        ]);
    }
}
