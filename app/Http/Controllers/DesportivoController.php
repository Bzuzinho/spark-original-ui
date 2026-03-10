<?php

namespace App\Http\Controllers;

use App\Models\AgeGroup;
use App\Models\AthleteStatusConfig;
use App\Models\Season;
use App\Models\Macrocycle;
use App\Models\Training;
use App\Models\TrainingAthlete;
use App\Models\Presence;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventResult;
use App\Models\EventType;
use App\Models\ConvocationGroup;
use App\Models\CostCenter;
use App\Models\User;
use App\Services\Desportivo\CreateTrainingAction;
use App\Services\Desportivo\PrepareTrainingAthletesAction;
use App\Services\Desportivo\SyncTrainingToEventAction;
use App\Services\Desportivo\UpdateTrainingAthleteAction;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DesportivoController extends Controller
{
    /**
     * Dashboard - Statísticas gerais do módulo desportivo
     */
    public function index(): Response
    {
        return $this->renderSportsPage('dashboard');
    }

    /**
     * Planeamento - Gestão de Épocas e Macrociclos
     */
    public function planeamento(): Response
    {
        return $this->renderSportsPage('planeamento');
    }

    /**
     * Treinos - Gestão de Treinos
     */
    public function treinos(): Response
    {
        return $this->renderSportsPage('treinos');
    }

    /**
     * Presenças - Gestão de Presenças
     */
    public function presencas(): Response
    {
        return $this->renderSportsPage('presencas-eventos');
    }

    /**
     * Competições e Resultados
     */
    public function competicoes(): Response
    {
        return $this->renderSportsPage('competicoes');
    }

    /**
     * Relatórios e Estatísticas
     */
    public function relatorios(): Response
    {
        return $this->renderSportsPage('relatorios');
    }

    private function renderSportsPage(string $tab): Response
    {
        $now = Carbon::now();
        $sevenDaysAgo = $now->copy()->subDays(7);
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $thirtyDaysAhead = $now->copy()->addDays(30);

        $athletesQuery = User::whereJsonContains('tipo_membro', 'atleta');
        $athletesCount = (clone $athletesQuery)->where('estado', 'ativo')->count();

        $trainings7Days = Training::where('data', '>=', $sevenDaysAgo->format('Y-m-d'))
            ->where('data', '<=', $now->format('Y-m-d'))
            ->count();

        $trainings30Days = Training::where('data', '>=', $thirtyDaysAgo->format('Y-m-d'))
            ->where('data', '<=', $now->format('Y-m-d'))
            ->count();

        $km7Days = Training::where('data', '>=', $sevenDaysAgo->format('Y-m-d'))
            ->sum('volume_planeado_m') / 1000;

        $km30Days = Training::where('data', '>=', $thirtyDaysAgo->format('Y-m-d'))
            ->sum('volume_planeado_m') / 1000;

        $upcomingCompetitions = Event::where('tipo', 'prova')
            ->where('data_inicio', '>=', $now)
            ->where('data_inicio', '<=', $thirtyDaysAhead)
            ->withCount('participants')
            ->orderBy('data_inicio')
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'nome' => $event->titulo,
                    'data_inicio' => $event->data_inicio,
                    'num_atletas_inscritos' => $event->participants_count,
                ];
            });

        $attendanceByGroup = DB::table('presences')
            ->leftJoin('age_groups', 'presences.escalao_id', '=', 'age_groups.id')
            ->where('presences.data', '>=', $thirtyDaysAgo->format('Y-m-d'))
            ->select('age_groups.nome',
                DB::raw("COUNT(CASE WHEN presences.status = 'presente' THEN 1 END) as presentes"),
                DB::raw("COUNT(CASE WHEN presences.status = 'ausente' THEN 1 END) as ausentes"),
                DB::raw('COUNT(*) as total'))
            ->groupBy('age_groups.id', 'age_groups.nome')
            ->get();

        $alerts = [];

        $medicalCerts = (clone $athletesQuery)
            ->where('estado', 'ativo')
            ->get()
            ->filter(function ($user) {
                if (empty($user->data_atestado_medico)) {
                    return false;
                }

                return Carbon::parse($user->data_atestado_medico)->diffInDays(Carbon::now()) >= 335;
            });

        if ($medicalCerts->count() > 0) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Atestados Médicos a Caducar',
                'message' => $medicalCerts->count() . ' atletas com atestado a caducar em 30 dias',
                'count' => $medicalCerts->count(),
            ];
        }

        $trainingsLast30Days = Training::where('data', '>=', $thirtyDaysAgo->format('Y-m-d'))->count();

        $lowAttendanceCount = 0;
        if ($trainingsLast30Days > 0) {
            $activeAthleteIds = (clone $athletesQuery)
                ->where('estado', 'ativo')
                ->pluck('id');

            $presenceByAthlete = Presence::whereIn('user_id', $activeAthleteIds)
                ->where('data', '>=', $thirtyDaysAgo->format('Y-m-d'))
                ->where('status', 'presente')
                ->select('user_id', DB::raw('COUNT(*) as presentes'))
                ->groupBy('user_id')
                ->pluck('presentes', 'user_id');

            foreach ($activeAthleteIds as $athleteId) {
                $presenceCount = (int) ($presenceByAthlete[$athleteId] ?? 0);

                if (($presenceCount / $trainingsLast30Days) < 0.5) {
                    $lowAttendanceCount++;
                }
            }
        }

        if ($lowAttendanceCount > 0) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Atletas com Baixa Presença',
                'message' => $lowAttendanceCount . ' atletas com presença inferior a 50%',
                'count' => $lowAttendanceCount,
            ];
        }

        $inactiveAthletes = (clone $athletesQuery)
            ->where('estado', 'inativo')
            ->count();

        if ($inactiveAthletes > 0) {
            $alerts[] = [
                'type' => 'info',
                'title' => 'Atletas Inativos',
                'message' => $inactiveAthletes . ' atletas marcados como inativos',
                'count' => $inactiveAthletes,
            ];
        }

        $activeSeason = Season::where('estado', 'Em curso')->first();

        $nextTrainings = Training::where('data', '>=', $now->format('Y-m-d'))
            ->where('data', '<=', $thirtyDaysAhead->format('Y-m-d'))
            ->orderBy('data')
            ->take(10)
            ->get();

        $seasons = Season::with(['macrocycles' => function ($query) {
                $query->orderBy('data_inicio');
            }])
            ->orderByDesc('data_inicio')
            ->get();
        $selectedSeason = request('season_id')
            ? Season::find(request('season_id'))
            : $activeSeason;
        $macrocycles = $selectedSeason
            ? $selectedSeason->macrocycles()->orderBy('data_inicio')->get()
            : collect();

        $trainings = Training::with('season')
            ->orderByDesc('data')
            ->paginate(25);

        $selectedTraining = request('training_id')
            ? Training::find(request('training_id'))
            : null;

        $presences = collect();
        if ($selectedTraining) {
            $presences = $selectedTraining->athleteRecords()
                ->with(['atleta'])
                ->get()
                ->map(function (TrainingAthlete $p) use ($selectedTraining) {
                    $legacyPresence = Presence::where('treino_id', $p->treino_id)
                        ->where('user_id', $p->user_id)
                        ->first();

                    return [
                        'id' => $p->id,
                        'legacy_presence_id' => $legacyPresence?->id,
                        'user_id' => $p->user_id,
                        'nome_atleta' => $p->atleta?->nome_completo,
                        'data' => Carbon::parse($selectedTraining->data)->toDateString(),
                        'status' => $p->estado,
                        'distancia_realizada_m' => $p->volume_real_m,
                        'classificacao' => $legacyPresence?->classificacao,
                        'notas' => $p->observacoes_tecnicas,
                    ];
                });
        }

        $competitions = Event::where('tipo', 'prova')
            ->orderByDesc('data_inicio')
            ->get(['id', 'titulo', 'data_inicio', 'local', 'tipo']);

        $eventos = Event::with(['creator', 'convocations', 'attendances', 'ageGroups'])
            ->orderBy('data_inicio', 'desc')
            ->get();

        $eventUsers = User::with(['athleteSportsData:id,user_id,escalao_id'])
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
            });

        $costCenters = CostCenter::where('ativo', true)
            ->orderBy('nome')
            ->get(['id', 'codigo', 'nome', 'ativo']);

        $eventTypes = EventType::where('ativo', true)
            ->orderBy('nome')
            ->get(['id', 'nome', 'visibilidade_default', 'ativo']);

        $convocations = ConvocationGroup::all();
        $attendances = EventAttendance::with('event', 'user')->get();

        $results = EventResult::with(['event', 'athlete'])
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        $seasonStart = $activeSeason?->data_inicio ?? $now->copy()->startOfYear();

        $volumeByAthlete = DB::table('presences')
            ->join('users', 'presences.user_id', '=', 'users.id')
            ->where('presences.data', '>=', $seasonStart)
            ->select('users.nome_completo', DB::raw('SUM(COALESCE(presences.distancia_realizada_m, 0)) as total_m'))
            ->groupBy('users.id', 'users.nome_completo')
            ->orderByDesc('total_m')
            ->get();

        $reportAttendanceByGroup = DB::table('presences')
            ->leftJoin('age_groups', 'presences.escalao_id', '=', 'age_groups.id')
            ->where('presences.data', '>=', $seasonStart)
            ->select('age_groups.nome',
                DB::raw("COUNT(CASE WHEN presences.status = 'presente' THEN 1 END) as presentes"),
                DB::raw("COUNT(CASE WHEN presences.status = 'ausente' THEN 1 END) as ausentes"),
                DB::raw('COUNT(*) as total'),
                DB::raw("ROUND(COUNT(CASE WHEN presences.status = 'presente' THEN 1 END) * 100.0 / NULLIF(COUNT(*),0), 2) as percentagem"))
            ->groupBy('age_groups.id', 'age_groups.nome')
            ->get();

        $competitionStats = Event::where('tipo', 'prova')
            ->where('data_inicio', '>=', $seasonStart)
            ->withCount('participants')
            ->orderByDesc('data_inicio')
            ->get();

        $sportsFinancialTotal = (float) DB::table('movements')
            ->where('data_emissao', '>=', $seasonStart)
            ->where(function ($query) {
                $query->where('origem_tipo', 'evento')
                    ->orWhere('tipo', 'inscricao');
            })
            ->sum(DB::raw('ABS(valor_total)'));

        $totalDistanceMeters = (float) DB::table('presences')
            ->where('data', '>=', $seasonStart)
            ->sum(DB::raw('COALESCE(distancia_realizada_m, 0)'));

        $totalDistanceKm = $totalDistanceMeters / 1000;
        $costPerKm = $totalDistanceKm > 0 ? $sportsFinancialTotal / $totalDistanceKm : null;

        return Inertia::render('Desportivo/Index', [
            'tab' => $tab,
            'stats' => [
                'athletesCount' => $athletesCount,
                'trainings7Days' => $trainings7Days,
                'trainings30Days' => $trainings30Days,
                'km7Days' => round($km7Days, 2),
                'km30Days' => round($km30Days, 2),
            ],
            'upcomingCompetitions' => $upcomingCompetitions,
            'attendanceByGroup' => $attendanceByGroup,
            'alerts' => $alerts,
            'activeSeason' => $activeSeason,
            'nextTrainings' => $nextTrainings,
            'seasons' => $seasons,
            'selectedSeason' => $selectedSeason,
            'macrocycles' => $macrocycles,
            'ageGroups' => AgeGroup::all(),
            'tiposEpoca' => ['Principal', 'Secundária', 'Época de Verão', 'Preparação', 'Pré-Época'],
            'estadosEpoca' => ['Planeada', 'Em curso', 'Concluída', 'Arquivada'],
            'tiposMacrociclo' => ['Preparação geral', 'Preparação específica', 'Competição', 'Taper', 'Transição'],
            'trainings' => $trainings,
            'trainingOptions' => Training::where('data', '>=', $thirtyDaysAgo->format('Y-m-d'))
                ->orderByDesc('data')
                ->get(['id', 'numero_treino', 'data']),
            'selectedTraining' => $selectedTraining,
            'presences' => $presences,
            'athletes' => (clone $athletesQuery)->where('estado', 'ativo')->get(['id', 'nome_completo']),
            'statusOptions' => AthleteStatusConfig::query()
                ->ativo()
                ->ordenado()
                ->pluck('codigo')
                ->values()
                ->all(),
            'classificacaoOptions' => ['Excelente', 'Bom', 'Satisfatório', 'Fraco'],
            'competitions' => $competitions,
            'results' => $results,
            'volumeByAthlete' => $volumeByAthlete,
            'reportAttendanceByGroup' => $reportAttendanceByGroup,
            'competitionStats' => $competitionStats,
            'eventos' => $eventos,
            'users' => $eventUsers,
            'costCenters' => $costCenters,
            'eventTypes' => $eventTypes,
            'convocations' => $convocations,
            'attendances' => $attendances,
            'financeVsSport' => [
                'totalFinancialWeight' => round($sportsFinancialTotal, 2),
                'totalSportDistanceKm' => round($totalDistanceKm, 2),
                'costPerKm' => $costPerKm !== null ? round($costPerKm, 2) : null,
            ],
        ]);
    }

    /**
     * Store a new Season
     */
    public function storeSeason(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'ano_temporada' => 'required|string|max:20',
            'data_inicio' => 'required|date',
            'data_fim' => 'required|date|after:data_inicio',
            'tipo' => 'required|in:Principal,Secundária,Época de Verão,Preparação,Pré-Época',
            'estado' => 'required|in:Planeada,Em curso,Concluída,Arquivada',
            'piscina_principal' => 'nullable|string',
            'escaloes_abrangidos' => 'nullable|array',
            'descricao' => 'nullable|string',
            'provas_alvo' => 'nullable|array',
            'volume_total_previsto' => 'nullable|integer',
            'volume_medio_semanal' => 'nullable|integer',
            'num_semanas_previsto' => 'nullable|integer',
            'num_competicoes_previstas' => 'nullable|integer',
            'objetivos_performance' => 'nullable|string',
            'objetivos_tecnicos' => 'nullable|string',
        ]);

        Season::create($validated);

        return redirect()->route('desportivo.planeamento')
            ->with('success', 'Época criada com sucesso!');
    }

    public function storeMacrocycle(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'epoca_id' => 'required|uuid|exists:seasons,id',
            'nome' => 'required|string|max:255',
            'tipo' => 'required|string|max:50',
            'data_inicio' => 'required|date',
            'data_fim' => 'required|date|after_or_equal:data_inicio',
            'escalao' => 'nullable|string|max:255',
        ]);

        Macrocycle::create($validated);

        return redirect()->route('desportivo.planeamento', ['season_id' => $validated['epoca_id']])
            ->with('success', 'Macrociclo criado com sucesso!');
    }

    public function updateMacrocycle(Request $request, Macrocycle $macrocycle): RedirectResponse
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'tipo' => 'required|string|max:50',
            'data_inicio' => 'required|date',
            'data_fim' => 'required|date|after_or_equal:data_inicio',
            'escalao' => 'nullable|string|max:255',
        ]);

        $macrocycle->update($validated);

        return redirect()->route('desportivo.planeamento', ['season_id' => $macrocycle->epoca_id])
            ->with('success', 'Macrociclo atualizado com sucesso!');
    }

    public function deleteMacrocycle(Macrocycle $macrocycle): RedirectResponse
    {
        $seasonId = $macrocycle->epoca_id;
        $macrocycle->delete();

        return redirect()->route('desportivo.planeamento', ['season_id' => $seasonId])
            ->with('success', 'Macrociclo eliminado com sucesso!');
    }

    /**
     * Update a Season
     */
    public function updateSeason(Request $request, Season $season): RedirectResponse
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'ano_temporada' => 'required|string|max:20',
            'data_inicio' => 'required|date',
            'data_fim' => 'required|date|after:data_inicio',
            'tipo' => 'required|in:Principal,Secundária,Época de Verão,Preparação,Pré-Época',
            'estado' => 'required|in:Planeada,Em curso,Concluída,Arquivada',
            'piscina_principal' => 'nullable|string',
            'escaloes_abrangidos' => 'nullable|array',
            'descricao' => 'nullable|string',
            'provas_alvo' => 'nullable|array',
            'volume_total_previsto' => 'nullable|integer',
            'volume_medio_semanal' => 'nullable|integer',
            'num_semanas_previsto' => 'nullable|integer',
            'num_competicoes_previstas' => 'nullable|integer',
            'objetivos_performance' => 'nullable|string',
            'objetivos_tecnicos' => 'nullable|string',
        ]);

        $season->update($validated);

        return redirect()->route('desportivo.planeamento')
            ->with('success', 'Época atualizada com sucesso!');
    }

    /**
     * Delete a Season
     */
    public function deleteSeason(Season $season): RedirectResponse
    {
        $season->delete();

        return redirect()->route('desportivo.planeamento')
            ->with('success', 'Época eliminada com sucesso!');
    }

    /**
     * Store a new Training
     */
    public function storeTraining(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'numero_treino' => 'nullable|string',
            'data' => 'required|date',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fim' => 'nullable|date_format:H:i',
            'local' => 'nullable|string',
            'epoca_id' => 'nullable|uuid|exists:seasons,id',
            'escaloes' => 'nullable|array',
            'tipo_treino' => 'required|string',
            'volume_planeado_m' => 'nullable|integer',
            'descricao_treino' => 'required|string',
            'notas_gerais' => 'nullable|string',
        ]);

        $training = app(CreateTrainingAction::class)->execute($validated, auth()->user());

        // Dual write temporário para compatibilidade com queries legacy
        if (config('desportivo.legacy_presences_enabled', true)) {
            $training->loadMissing('athleteRecords');
            foreach ($training->athleteRecords as $record) {
                Presence::updateOrCreate(
                    [
                        'treino_id' => $training->id,
                        'user_id' => $record->user_id,
                    ],
                    [
                        'data' => Carbon::parse($validated['data'])->toDateString(),
                        'tipo' => 'treino',
                        'status' => 'ausente',
                        'presente' => false,
                        'is_legacy' => false,
                    ]
                );
            }
        }

        return redirect()->route('desportivo.treinos')
            ->with('success', 'Treino criado com sucesso e evento adicionado ao calendário!');
    }

    /**
     * Update Training
     */
    public function updateTraining(Request $request, Training $training): RedirectResponse
    {
        $validated = $request->validate([
            'numero_treino' => 'nullable|string',
            'data' => 'required|date',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fim' => 'nullable|date_format:H:i',
            'local' => 'nullable|string',
            'epoca_id' => 'nullable|uuid|exists:seasons,id',
            'escaloes' => 'nullable|array',
            'tipo_treino' => 'required|string',
            'volume_planeado_m' => 'nullable|integer',
            'descricao_treino' => 'required|string',
            'notas_gerais' => 'nullable|string',
        ]);

        $training->update([
            ...$validated,
            'escaloes' => $validated['escaloes'] ?? [],
        ]);

        if ($training->evento_id) {
            $training->loadMissing('event');

            if ($training->event) {
                $escaloes = $validated['escaloes'] ?? [];
                $escaloesNomes = !empty($escaloes)
                    ? AgeGroup::whereIn('id', $escaloes)->pluck('nome')->implode(', ')
                    : ucfirst((string) $training->tipo_treino);
                $date = Carbon::parse($validated['data'])->format('d/m/Y');

                $training->event->update([
                    'titulo' => "Treino - {$escaloesNomes} ({$date})",
                    'data_inicio' => Carbon::parse($validated['data'])->toDateString(),
                    'hora_inicio' => $validated['hora_inicio'] ?? $training->event->hora_inicio,
                    'data_fim' => Carbon::parse($validated['data'])->toDateString(),
                    'hora_fim' => $validated['hora_fim'] ?? $training->event->hora_fim,
                    'local' => $validated['local'] ?? $training->event->local,
                    'descricao' => $validated['descricao_treino'] ?? $training->event->descricao,
                ]);

                $training->event->syncAgeGroups($escaloes);
            }
        }

        app(PrepareTrainingAthletesAction::class)
            ->updateForChangedEscaloes($training->fresh(), $validated['escaloes'] ?? []);

        app(SyncTrainingToEventAction::class)->execute($training->fresh('athleteRecords'));

        return redirect()->route('desportivo.treinos')
            ->with('success', 'Treino atualizado com sucesso!');
    }

    /**
     * Duplicate Training
     */
    public function duplicateTraining(Training $training): RedirectResponse
    {
        $newTrainingDate = Carbon::parse($training->data)->addDays(7)->format('Y-m-d');

        app(CreateTrainingAction::class)->execute([
            'data' => $newTrainingDate,
            'hora_inicio' => $training->hora_inicio,
            'hora_fim' => $training->hora_fim,
            'local' => $training->local,
            'epoca_id' => $training->epoca_id,
            'microciclo_id' => $training->microciclo_id,
            'tipo_treino' => $training->tipo_treino,
            'volume_planeado_m' => $training->volume_planeado_m,
            'descricao_treino' => $training->descricao_treino,
            'notas_gerais' => $training->notas_gerais,
            'escaloes' => is_array($training->escaloes) ? $training->escaloes : [],
        ], auth()->user());

        return redirect()->route('desportivo.treinos')
            ->with('success', 'Treino duplicado com sucesso!');
    }

    /**
     * Delete Training
     */
    public function deleteTraining(Training $training): RedirectResponse
    {
        DB::transaction(function () use ($training) {
            if (config('desportivo.legacy_presences_enabled', true)) {
                $training->presences()->delete();
            }

            if ($training->evento_id) {
                Event::where('id', $training->evento_id)->delete();
            }

            $training->delete();
        });

        return redirect()->route('desportivo.treinos')
            ->with('success', 'Treino eliminado com sucesso!');
    }

    /**
     * Update Presences
     */
    public function updatePresencas(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'presences' => 'required|array',
            'presences.*.id' => 'required|uuid',
            'presences.*.legacy_presence_id' => 'nullable|uuid',
            'presences.*.status' => 'required|in:presente,ausente,justificado,atestado_medico,outro,lesionado,limitado,doente',
            'presences.*.distancia_realizada_m' => 'nullable|integer',
            'presences.*.classificacao' => 'nullable|string',
            'presences.*.notas' => 'nullable|string',
        ]);

        $updateAction = app(UpdateTrainingAthleteAction::class);

        foreach ($validated['presences'] as $presenceData) {
            $trainingAthlete = TrainingAthlete::find($presenceData['id']);

            // Compatibilidade: caso frontend ainda envie id de presences
            if (!$trainingAthlete) {
                $legacyPresence = Presence::find($presenceData['id']);
                if ($legacyPresence) {
                    $trainingAthlete = TrainingAthlete::where('treino_id', $legacyPresence->treino_id)
                        ->where('user_id', $legacyPresence->user_id)
                        ->first();
                }
            }

            if (!$trainingAthlete) {
                continue;
            }

            $updateAction->execute($trainingAthlete, [
                'estado' => $presenceData['status'] === 'atestado_medico' ? 'justificado' : $presenceData['status'],
                'volume_real_m' => $presenceData['distancia_realizada_m'] ?? null,
                'observacoes_tecnicas' => $presenceData['notas'] ?? null,
            ], auth()->user());

            // Dual write temporário para tabela legacy
            if (config('desportivo.legacy_presences_enabled', true)) {
                $legacyPresenceId = $presenceData['legacy_presence_id'] ?? null;
                $legacyPresence = $legacyPresenceId
                    ? Presence::find($legacyPresenceId)
                    : Presence::where('treino_id', $trainingAthlete->treino_id)
                        ->where('user_id', $trainingAthlete->user_id)
                        ->first();

                if ($legacyPresence) {
                    $legacyPresence->update([
                        'status' => $presenceData['status'],
                        'distancia_realizada_m' => $presenceData['distancia_realizada_m'] ?? null,
                        'classificacao' => $presenceData['classificacao'] ?? null,
                        'notas' => $presenceData['notas'] ?? null,
                        'presente' => in_array($presenceData['status'], ['presente', 'limitado'], true),
                        'is_legacy' => false,
                    ]);
                }
            }
        }

        return redirect()->route('desportivo.presencas')
            ->with('success', 'Presenças atualizadas com sucesso!');
    }

    /**
     * Mark all as present
     */
    public function markAllPresent(Request $request): RedirectResponse
    {
        $trainingId = $request->input('training_id');

        $athleteIds = TrainingAthlete::where('treino_id', $trainingId)->pluck('id')->toArray();
        app(UpdateTrainingAthleteAction::class)->markMultiplePresent($athleteIds, auth()->user());

        if (config('desportivo.legacy_presences_enabled', true)) {
            Presence::where('treino_id', $trainingId)
                ->update([
                    'status' => 'presente',
                    'presente' => true,
                    'is_legacy' => false,
                ]);
        }

        return redirect()->route('desportivo.presencas')
            ->with('success', 'Todos os atletas foram marcados como presentes!');
    }

    /**
     * Clear all presences
     */
    public function clearAllPresences(Request $request): RedirectResponse
    {
        $trainingId = $request->input('training_id');

        app(UpdateTrainingAthleteAction::class)->clearAllPresences($trainingId, auth()->user());

        if (config('desportivo.legacy_presences_enabled', true)) {
            Presence::where('treino_id', $trainingId)
                ->update([
                    'status' => 'ausente',
                    'presente' => false,
                    'distancia_realizada_m' => null,
                    'classificacao' => null,
                    'notas' => null,
                    'is_legacy' => false,
                ]);
        }

        return redirect()->route('desportivo.presencas')
            ->with('success', 'Classificações removidas!');
    }
}
