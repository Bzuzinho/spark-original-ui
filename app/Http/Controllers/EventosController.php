<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use App\Models\EventTypeConfig;
use App\Models\EventConvocation;
use App\Models\ConvocationGroup;
use App\Models\EventAttendance;
use App\Models\EventResult;
use App\Models\CostCenter;
use App\Models\AgeGroup;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class EventosController extends Controller
{
    public function index(): Response
    {
        // Get stats
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        
        $stats = [
            'totalEvents' => Event::count(),
            'upcomingEvents' => Event::where('data_inicio', '>=', $now)
                ->where('estado', '!=', 'cancelado')
                ->count(),
            'monthParticipants' => EventConvocation::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count(),
            'completedEvents' => Event::where('estado', 'concluido')
                ->whereYear('data_inicio', $now->year)
                ->count(),
            'activeConvocatorias' => EventConvocation::whereHas('event', function($query) use ($now) {
                $query->where('data_inicio', '>=', $now);
            })->count(),
        ];

        $ageGroups = AgeGroup::where('ativo', true)
            ->orderBy('idade_minima')
            ->get(['id', 'nome', 'idade_minima', 'idade_maxima', 'ativo']);

        return Inertia::render('Eventos/Index', [
            'eventos' => Event::with(['creator', 'convocations', 'attendances', 'ageGroups']) // ✅ Carregar ageGroups
                ->orderBy('data_inicio', 'desc')
                ->get(),
            'stats' => $stats,
            'users' => User::with(['athleteSportsData:id,user_id,escalao_id'])
                ->where('estado', 'ativo')
                ->get([
                    'id',
                    'nome_completo',
                    'perfil',
                    'email',
                    'numero_socio',
                    'estado',
                    'tipo_membro',
                    'escalao',
                ])
                ->map(function (User $user) {
                    $userEscaloes = $user->escalao;

                    if ((!is_array($userEscaloes) || count($userEscaloes) === 0) && $user->athleteSportsData?->escalao_id) {
                        $user->escalao = [(string) $user->athleteSportsData->escalao_id];
                    }

                    unset($user->athleteSportsData);

                    return $user;
                }),
            'costCenters' => CostCenter::where('ativo', true)
                ->orderBy('nome')
                ->get(['id', 'codigo', 'nome', 'ativo']),
            'ageGroups' => $ageGroups,
            'convocations' => ConvocationGroup::all(),
            'attendances' => EventAttendance::with('event', 'user')->get(),
            'results' => EventResult::with(['event', 'user', 'ageGroup'])->get(),
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
        
        // ✅ Extrair escaloes_elegiveis para sync posterior
        $escaloesElegiveis = $this->normalizeEscaloesToIds($data['escaloes_elegiveis'] ?? []);
        unset($data['escaloes_elegiveis']); // Remover do array (não é campo da tabela)
        
        $data['criado_por'] = $data['criado_por'] ?? auth()->id();
        $data['descricao'] = $data['descricao'] ?? '';
        
        // Set default estado if not provided
        if (!isset($data['estado'])) {
            $data['estado'] = 'rascunho';
        }
        
        // Handle recurrence
        if ($data['recorrente'] ?? false) {
            $parentEvent = Event::create($data);
            
            // ✅ Sync escalões e criar presenças
            if (!empty($escaloesElegiveis)) {
                $parentEvent->syncAgeGroups($escaloesElegiveis);
            }
            
            $this->generateRecurringEvents($parentEvent, $data, $escaloesElegiveis);
            $event = $parentEvent;
        } else {
            $event = Event::create($data);
            
            // ✅ Sync escalões e criar presenças
            if (!empty($escaloesElegiveis)) {
                $event->syncAgeGroups($escaloesElegiveis);
            }
        }

        return redirect()->route('eventos.index')
            ->with('success', 'Evento criado com sucesso!');
    }

    /**
     * Generate recurring events
     */
    private function generateRecurringEvents(Event $parentEvent, array $data, array $escaloesElegiveis = []): void
    {
        if (!($data['recorrente'] ?? false)) {
            return;
        }

        $startDate = Carbon::parse($data['recorrencia_data_inicio']);
        $endDate = Carbon::parse($data['recorrencia_data_fim']);
        $selectedDays = $data['recorrencia_dias_semana'] ?? [];

        if (empty($selectedDays)) {
            return;
        }

        $period = CarbonPeriod::create($startDate, '1 day', $endDate);

        foreach ($period as $date) {
            // Check if this day of the week is selected (0 = Sunday, 1 = Monday, etc.)
            if (in_array((string)$date->dayOfWeek, $selectedDays)) {
                $eventData = $data;
                $eventData['data_inicio'] = $date->toDateString();
                $eventData['recorrente'] = false;
                $eventData['evento_pai_id'] = $parentEvent->id;
                
                // If there's a data_fim, adjust it accordingly
                if (isset($data['data_fim'])) {
                    $originalStartDate = Carbon::parse($data['data_inicio']);
                    $originalEndDate = Carbon::parse($data['data_fim']);
                    $daysOffset = $originalStartDate->diffInDays($originalEndDate);
                    $eventData['data_fim'] = $date->addDays($daysOffset)->toDateString();
                }

                $childEvent = Event::create($eventData);
                
                // ✅ Sync escalões e criar presenças
                if (!empty($escaloesElegiveis)) {
                    $childEvent->syncAgeGroups($escaloesElegiveis);
                }
            }
        }
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
        
        // ✅ Extrair escaloes_elegiveis para sync posterior
        $escaloesElegiveis = $this->normalizeEscaloesToIds($data['escaloes_elegiveis'] ?? []);
        unset($data['escaloes_elegiveis']); // Remover do array (não é campo da tabela)
        
        $data['descricao'] = $data['descricao'] ?? $evento->descricao ?? '';
        
        // If this is a parent recurring event, handle updates
        if ($evento->recorrente && ($data['recorrente'] ?? false)) {
            // Delete old child events and regenerate
            $evento->childEvents()->delete();
            $evento->update($data);
            
            // ✅ Sync escalões e atualizar presenças
            $evento->syncAgeGroups($escaloesElegiveis);
            
            $this->generateRecurringEvents($evento, $data, $escaloesElegiveis);
        } else {
            $evento->update($data);
            
            // ✅ Sync escalões e atualizar presenças
            $evento->syncAgeGroups($escaloesElegiveis);
        }

        return redirect()->route('eventos.index')
            ->with('success', 'Evento atualizado com sucesso!');
    }

    public function destroy(Event $evento): RedirectResponse
    {
        // If this is a parent event, also delete child events
        if ($evento->recorrente) {
            $evento->childEvents()->delete();
        }

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

    private function normalizeEscaloesToIds(array $values, $ageGroups = null): array
    {
        if (!is_array($values) || count($values) === 0) {
            return [];
        }

        $source = $ageGroups ?? AgeGroup::query()->get(['id', 'nome']);
        $ageGroupsById = $source->mapWithKeys(fn (AgeGroup $group) => [(string) $group->id => (string) $group->id]);
        $ageGroupsByName = $source
            ->filter(fn (AgeGroup $group) => !empty($group->nome))
            ->mapWithKeys(fn (AgeGroup $group) => [mb_strtolower(trim($group->nome)) => (string) $group->id]);

        return collect($values)
            ->filter(fn ($value) => is_string($value) && trim($value) !== '')
            ->map(function (string $value) use ($ageGroupsById, $ageGroupsByName) {
                $trimmedValue = trim($value);

                return $ageGroupsById[$trimmedValue]
                    ?? $ageGroupsByName[mb_strtolower($trimmedValue)]
                    ?? null;
            })
            ->filter()
            ->unique()
            ->values()
            ->all();
    }
}
