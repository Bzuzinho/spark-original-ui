<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use App\Models\EventTypeConfig;
use App\Models\EventConvocation;
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
            'upcomingEvents' => Event::where('data_inicio', '>=', $now)
                ->where('estado', '!=', 'cancelado')
                ->count(),
            'monthParticipants' => EventConvocation::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count(),
            'completedEvents' => Event::where('estado', 'concluido')
                ->whereYear('data_inicio', $now->year)
                ->count(),
        ];

        return Inertia::render('Eventos/Index', [
            'events' => Event::with(['creator', 'convocations.athlete', 'attendances.athlete'])
                ->orderBy('data_inicio', 'desc')
                ->get(),
            'stats' => $stats,
            'users' => User::where('estado', 'ativo')->get(['id', 'nome_completo', 'perfil']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Eventos/Create', [
            'eventTypes' => EventTypeConfig::where('ativo', true)->get(),
            'users' => User::where('estado', 'ativo')->get(),
        ]);
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['criado_por'] = $data['criado_por'] ?? auth()->id();
        $data['descricao'] = $data['descricao'] ?? '';
        
        // Set default estado if not provided
        if (!isset($data['estado'])) {
            $data['estado'] = 'rascunho';
        }
        
        $event = Event::create($data);

        return redirect()->route('eventos.index')
            ->with('success', 'Evento criado com sucesso!');
    }

    public function show(Event $evento): Response
    {
        return Inertia::render('Eventos/Show', [
            'event' => $evento->load([
                'creator',
                'tipoConfig',
                'convocations.user',
                'attendances.user',
                'results',
            ]),
        ]);
    }

    public function edit(Event $evento): Response
    {
        return Inertia::render('Eventos/Edit', [
            'event' => $evento->load(['tipoConfig']),
            'eventTypes' => EventTypeConfig::where('ativo', true)->get(),
            'users' => User::where('estado', 'ativo')->get(),
        ]);
    }

    public function update(UpdateEventRequest $request, Event $evento): RedirectResponse
    {
        $data = $request->validated();
        $data['descricao'] = $data['descricao'] ?? $evento->descricao ?? '';
        $evento->update($data);

        return redirect()->route('eventos.index')
            ->with('success', 'Evento atualizado com sucesso!');
    }

    public function destroy(Event $evento): RedirectResponse
    {
        $evento->delete();

        return redirect()->route('eventos.index')
            ->with('success', 'Evento eliminado com sucesso!');
    }

    /**
     * Add a participant to an event
     */
    public function addParticipant(Request $request, Event $evento): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'estado_confirmacao' => 'nullable|in:confirmado,pendente,recusado',
            'status' => 'nullable|in:confirmado,pendente,recusado',
            'observacoes' => 'nullable|string',
            'justificacao' => 'nullable|string',
            'transporte_clube' => 'nullable|boolean',
        ]);

        $estadoConfirmacao = $request->input('estado_confirmacao', $request->input('status', 'pendente'));

        // Check if participant already exists
        $existing = EventConvocation::where('evento_id', $evento->id)
            ->where('user_id', $request->user_id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Participante já adicionado a este evento',
            ], 422);
        }

        $convocation = EventConvocation::create([
            'evento_id' => $evento->id,
            'user_id' => $request->user_id,
            'data_convocatoria' => now()->toDateString(),
            'estado_confirmacao' => $estadoConfirmacao,
            'observacoes' => $request->input('observacoes'),
            'justificacao' => $request->input('justificacao'),
            'transporte_clube' => (bool) $request->input('transporte_clube', false),
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
        $convocation = EventConvocation::where('evento_id', $evento->id)
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
            'estado_confirmacao' => 'nullable|in:confirmado,pendente,recusado',
            'status' => 'nullable|in:confirmado,pendente,recusado',
            'observacoes' => 'nullable|string',
            'justificacao' => 'nullable|string',
        ]);

        $estadoConfirmacao = $request->input('estado_confirmacao', $request->input('status'));

        if (!$estadoConfirmacao) {
            return response()->json([
                'message' => 'Estado de confirmação obrigatório',
            ], 422);
        }

        $convocation = EventConvocation::where('evento_id', $evento->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$convocation) {
            return response()->json([
                'message' => 'Participante não encontrado neste evento',
            ], 404);
        }

        $convocation->update([
            'estado_confirmacao' => $estadoConfirmacao,
            'observacoes' => $request->input('observacoes'),
            'justificacao' => $request->input('justificacao'),
            'data_resposta' => now(),
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
            'upcomingEvents' => Event::where('data_inicio', '>=', $now)
                ->where('estado', '!=', 'cancelado')
                ->count(),
            'monthParticipants' => EventConvocation::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count(),
            'completedEvents' => Event::where('estado', 'concluido')
                ->whereYear('data_inicio', $now->year)
                ->count(),
        ]);
    }
}
