<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use App\Models\EventTypeConfig;
use App\Models\EventType;
use App\Models\EventConvocation;
use App\Models\ConvocationGroup;
use App\Models\EventAttendance;
use App\Models\EventResult;
use App\Models\Competition;
use App\Models\Result;
use App\Models\CostCenter;
use App\Models\AgeGroup;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class EventosController extends Controller
{
    public function index(): Response
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $eventos = Cache::remember('eventos:list', 60, fn () =>
            Event::with([
                'creator:id,name',
                'ageGroups' => function ($q) {
                    $q->select('age_groups.id', 'age_groups.nome');
                },
            ])
                ->select(
                    'id', 'titulo', 'descricao', 'data_inicio', 'hora_inicio',
                    'data_fim', 'hora_fim', 'estado', 'local', 'tipo', 'visibilidade',
                    'criado_por', 'created_at', 'tipo_config_id', 'centro_custo_id'
                )
                ->orderBy('data_inicio', 'desc')
                ->get()
        );

        $eventosAtivos = $eventos->filter(fn (Event $event) => $event->estado !== 'cancelado');

        $stats = Cache::remember('eventos:stats:' . $now->format('Y-m'), 60, function () use ($now, $startOfMonth, $endOfMonth, $eventos, $eventosAtivos) {
            return [
                'totalEvents' => $eventos->count(),
                'upcomingEvents' => $eventosAtivos->filter(fn (Event $event) => $event->estado === 'agendado')->count(),
                'monthParticipants' => EventConvocation::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
                'completedEvents' => $eventos
                    ->filter(fn (Event $event) => $event->data_inicio?->year === $now->year)
                    ->filter(fn (Event $event) => $event->estado === 'concluido')
                    ->count(),
                'activeConvocatorias' => EventConvocation::whereHas('event', function ($query) use ($now) {
                    $query->where('data_inicio', '>=', $now);
                })->count(),
            ];
        });

        $ageGroups = Cache::remember('eventos:age_groups', 300, fn () =>
            AgeGroup::where('ativo', true)->orderBy('idade_minima')->get(['id', 'nome', 'idade_minima', 'idade_maxima', 'ativo'])
        );

        $results = Cache::remember('eventos:results', 60, function () {
            $competitionEventIds = Competition::query()
                ->whereNotNull('evento_id')
                ->pluck('evento_id')
                ->map(fn ($id) => (string) $id)
                ->unique();

            $eventResults = EventResult::with([
                'event:id,titulo,estado',
                'user:id,nome_completo',
                'ageGroup:id,nome',
            ])
                ->get()
                ->reject(fn (EventResult $result) => $competitionEventIds->contains((string) $result->evento_id))
                ->values();

            $legacyCompetitionResults = Result::with([
                'prova:id,competicao_id,distancia_m,estilo',
                'prova.competition:id,evento_id',
                'prova.competition.evento:id,titulo,estado',
                'athlete:id,nome_completo',
            ])
                ->get()
                ->map(function (Result $result) {
                    $competition = $result->prova?->competition;
                    $event = $competition?->evento;

                    return [
                        'id' => 'legacy_' . $result->id,
                        'evento_id' => $competition?->evento_id,
                        'user_id' => $result->user_id,
                        'prova' => trim((string) (($result->prova?->distancia_m ?? '') . ' ' . ($result->prova?->estilo ?? ''))),
                        'tempo' => $result->tempo_oficial,
                        'classificacao' => $result->posicao,
                        'event' => $event ? [
                            'id' => $event->id,
                            'titulo' => $event->titulo,
                            'estado' => $event->estado,
                        ] : null,
                        'user' => $result->athlete ? [
                            'id' => $result->athlete->id,
                            'nome_completo' => $result->athlete->nome_completo,
                        ] : null,
                    ];
                })
                ->values();

            return $eventResults
                ->map(fn (EventResult $result) => $result->toArray())
                ->concat($legacyCompetitionResults)
                ->values();
        });

        $users = Cache::remember('eventos:users', 60, fn () =>
            User::with(['athleteSportsData:id,user_id,escalao_id'])
                ->where('estado', 'ativo')
                ->get(['id', 'nome_completo', 'perfil', 'email', 'numero_socio', 'estado', 'tipo_membro', 'escalao'])
                ->map(function (User $user) {
                    if ((!is_array($user->escalao) || count($user->escalao) === 0) && $user->athleteSportsData?->escalao_id) {
                        $user->escalao = [(string) $user->athleteSportsData->escalao_id];
                    }
                    unset($user->athleteSportsData);
                    return $user;
                })
        );

        $costCenters = Cache::remember('eventos:cost_centers', 300, fn () =>
            CostCenter::where('ativo', true)->orderBy('nome')->get(['id', 'codigo', 'nome', 'ativo'])
        );

        $eventTypes = Cache::remember('eventos:event_types', 300, fn () =>
            EventType::where('ativo', true)->orderBy('nome')->get(['id', 'nome', 'visibilidade_default', 'ativo'])
        );

        $convocations = Cache::remember('eventos:convocations', 60, fn () =>
            EventConvocation::with(['event:id,titulo,data_inicio', 'user:id,nome_completo'])->get()
        );

        $attendances = Cache::remember('eventos:attendances', 60, fn () =>
            EventAttendance::with([
                'event:id,titulo,data_inicio,estado',
                'user:id,nome_completo,numero_socio',
            ])->get()
        );

        return Inertia::render('Eventos/Index', [
            'eventos'      => $eventos,
            'stats'        => $stats,
            'users'        => $users,
            'costCenters'  => $costCenters,
            'eventTypes'   => $eventTypes,
            'ageGroups'    => $ageGroups,
            'convocations' => $convocations,
            'attendances'  => $attendances,
            'results'      => $results,
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

        Cache::forget('eventos:list');
        Cache::forget('eventos:stats:' . now()->format('Y-m'));
        Cache::forget('eventos:results');
        Cache::forget('dashboard:stats');
        Cache::forget('dashboard:recent_events');
        Cache::forget('dashboard:recent_activity');

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

        Cache::forget('eventos:list');
        Cache::forget('eventos:stats:' . now()->format('Y-m'));
        Cache::forget('eventos:results');
        Cache::forget('dashboard:recent_events');

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

        Cache::forget('eventos:list');
        Cache::forget('eventos:stats:' . now()->format('Y-m'));
        Cache::forget('eventos:results');
        Cache::forget('dashboard:stats');
        Cache::forget('dashboard:recent_events');
        Cache::forget('dashboard:recent_activity');

        return redirect()->route('eventos.index')
            ->with('success', 'Evento eliminado com sucesso!');
    }

    /**
     * Add a participant to an event
     */
    public function addParticipant(Request $request, Event $event): JsonResponse
    {
        if (!$event->canEditAttendances()) {
            $trainingId = $event->trainings()->value('id');

            return response()->json([
                'message' => 'As presencas deste treino sao geridas no modulo Desportivo.',
                'redirect' => $trainingId
                    ? route('desportivo.presencas', ['training_id' => $trainingId])
                    : route('desportivo.presencas'),
            ], 403);
        }

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
        $existing = EventConvocation::where('evento_id', $event->id)
            ->where('user_id', $request->user_id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Participante já adicionado a este evento',
            ], 422);
        }

        $convocation = EventConvocation::create([
            'evento_id' => $event->id,
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
    public function removeParticipant(Event $event, User $user): JsonResponse
    {
        if (!$event->canEditAttendances()) {
            $trainingId = $event->trainings()->value('id');

            return response()->json([
                'message' => 'As presencas deste treino sao geridas no modulo Desportivo.',
                'redirect' => $trainingId
                    ? route('desportivo.presencas', ['training_id' => $trainingId])
                    : route('desportivo.presencas'),
            ], 403);
        }

        $convocation = EventConvocation::where('evento_id', $event->id)
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
    public function updateParticipantStatus(Request $request, Event $event, User $user): JsonResponse
    {
        if (!$event->canEditAttendances()) {
            $trainingId = $event->trainings()->value('id');

            return response()->json([
                'message' => 'As presencas deste treino sao geridas no modulo Desportivo.',
                'redirect' => $trainingId
                    ? route('desportivo.presencas', ['training_id' => $trainingId])
                    : route('desportivo.presencas'),
            ], 403);
        }

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

        $convocation = EventConvocation::where('evento_id', $event->id)
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
        $eventos = Event::query()->get();
        $eventosAtivos = $eventos->filter(fn (Event $event) => $event->estado !== 'cancelado');
        
        return response()->json([
            'upcomingEvents' => $eventosAtivos->filter(fn (Event $event) => $event->estado === 'agendado')->count(),
            'monthParticipants' => EventConvocation::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count(),
            'completedEvents' => $eventos
                ->filter(fn (Event $event) => $event->data_inicio?->year === $now->year)
                ->filter(fn (Event $event) => $event->estado === 'concluido')
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
