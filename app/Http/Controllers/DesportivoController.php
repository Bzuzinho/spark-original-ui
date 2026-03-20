<?php

namespace App\Http\Controllers;

use App\Models\AgeGroup;
use App\Models\AthleteStatusConfig;
use App\Models\Season;
use App\Models\Macrocycle;
use App\Models\Mesocycle;
use App\Models\Microcycle;
use App\Models\Training;
use App\Models\TrainingAthlete;
use App\Models\TrainingMetric;
use App\Models\Competition;
use App\Models\ProvaTipo;
use App\Models\Result;
use App\Models\TeamResult;
use App\Models\Event;
use App\Models\EventType;
use App\Models\EventAttendance;
use App\Models\ConvocationGroup;
use App\Models\ConvocationAthlete;
use App\Models\CostCenter;
use App\Models\TrainingTypeConfig;
use App\Models\TrainingZoneConfig;
use App\Models\User;
use App\Http\Requests\Sports\StoreTrainingRequest;
use App\Http\Requests\Sports\ScheduleTrainingRequest;
use App\Http\Requests\Sports\UpdateTrainingRequest;
use App\Http\Requests\Sports\StoreTrainingMetricRequest;
use App\Services\Desportivo\CreateTrainingAction;
use App\Services\Desportivo\PrepareTrainingAthletesAction;
use App\Services\Desportivo\UpdateTrainingAthleteAction;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
        return $this->renderSportsPage('presencas');
    }

    /**
     * Cais - Vista independente para operação rápida de presenças
     */
    public function cais(): Response
    {
        return $this->renderSportsPage('cais', 'Desportivo/Cais');
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

    private function renderSportsPage(string $tab, string $view = 'Desportivo/Index'): Response
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

        $upcomingCompetitions = Competition::query()
            ->where('data_inicio', '>=', $now->toDateString())
            ->where('data_inicio', '<=', $thirtyDaysAhead->toDateString())
            ->withCount('results')
            ->orderBy('data_inicio')
            ->get()
            ->map(function ($competition) {
                return [
                    'id' => $competition->id,
                    'nome' => $competition->nome,
                    'data_inicio' => $competition->data_inicio,
                    'num_atletas_inscritos' => $competition->results_count,
                ];
            });

        $attendanceByGroup = DB::table('training_athletes')
            ->join('trainings', 'training_athletes.treino_id', '=', 'trainings.id')
            ->join('athlete_sports_data', 'training_athletes.user_id', '=', 'athlete_sports_data.user_id')
            ->leftJoin('age_groups', 'athlete_sports_data.escalao_id', '=', 'age_groups.id')
            ->where('trainings.data', '>=', $thirtyDaysAgo->format('Y-m-d'))
            ->select('age_groups.nome',
                DB::raw("COUNT(CASE WHEN training_athletes.estado = 'presente' THEN 1 END) as presentes"),
                DB::raw("COUNT(CASE WHEN training_athletes.estado = 'ausente' THEN 1 END) as ausentes"),
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

            $presenceByAthlete = DB::table('training_athletes')
                ->join('trainings', 'training_athletes.treino_id', '=', 'trainings.id')
                ->whereIn('training_athletes.user_id', $activeAthleteIds)
                ->where('trainings.data', '>=', $thirtyDaysAgo->format('Y-m-d'))
                ->where('training_athletes.estado', 'presente')
                ->select('training_athletes.user_id', DB::raw('COUNT(*) as presentes'))
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

        $hasMesocycleObjectiveColumns = Schema::hasColumn('mesocycles', 'objetivo_principal')
            && Schema::hasColumn('mesocycles', 'objetivo_secundario');

        $mesocycleColumns = ['id', 'macrociclo_id', 'nome', 'foco', 'data_inicio', 'data_fim'];
        if ($hasMesocycleObjectiveColumns) {
            $mesocycleColumns[] = 'objetivo_principal';
            $mesocycleColumns[] = 'objetivo_secundario';
        }

        $mesocycles = $macrocycles->isEmpty()
            ? collect()
            : Mesocycle::query()
                ->whereIn('macrociclo_id', $macrocycles->pluck('id')->values())
                ->orderBy('data_inicio')
                ->get($mesocycleColumns)
                ->map(fn (Mesocycle $mesocycle) => [
                    'id' => $mesocycle->id,
                    'macrociclo_id' => $mesocycle->macrociclo_id,
                    'nome' => $mesocycle->nome,
                    'data_inicio' => optional($mesocycle->data_inicio)->toDateString(),
                    'data_fim' => optional($mesocycle->data_fim)->toDateString(),
                    'objetivo_principal' => ($hasMesocycleObjectiveColumns ? $mesocycle->objetivo_principal : null) ?: $mesocycle->foco,
                    'objetivo_secundario' => $hasMesocycleObjectiveColumns ? $mesocycle->objetivo_secundario : null,
                ])
                ->values();

        $macrocycleIds = $macrocycles->pluck('id')->values();

        $microcycles = $macrocycleIds->isEmpty()
            ? collect()
            : Microcycle::query()
                ->select('microcycles.id', 'microcycles.semana', 'microcycles.mesociclo_id', 'mesocycles.macrociclo_id')
                ->join('mesocycles', 'mesocycles.id', '=', 'microcycles.mesociclo_id')
                ->whereIn('mesocycles.macrociclo_id', $macrocycleIds)
                ->orderBy('microcycles.semana')
                ->get()
                ->map(fn (Microcycle $microcycle) => [
                    'id' => $microcycle->id,
                    'nome' => $microcycle->semana,
                    'mesociclo_id' => $microcycle->mesociclo_id,
                    'macrocycle_id' => $microcycle->macrociclo_id,
                ])
                ->values();

        $hasTrainingAgeGroupPivot = Schema::hasTable('training_age_group');

        $trainingQuery = Training::query()->with(['season', 'series', 'athleteRecords.atleta']);

        if ($hasTrainingAgeGroupPivot) {
            $trainingQuery->with('ageGroups:id');
        }

        $trainings = $trainingQuery
            ->orderByDesc('data')
            ->paginate(25)
            ->through(function (Training $training) use ($hasTrainingAgeGroupPivot) {
                $escaloes = $hasTrainingAgeGroupPivot
                    ? $training->ageGroups->pluck('id')->values()->all()
                    : (array) ($training->escaloes ?? []);

                $training->setAttribute('escaloes', $escaloes);

                // Expose presence group for scheduled trainings
                if ($training->data !== null) {
                    $training->setAttribute('presencas_grupo', $training->athleteRecords->map(fn (TrainingAthlete $p) => [
                        'id'           => $p->id,
                        'user_id'      => $p->user_id,
                        'nome_atleta'  => $p->atleta?->nome_completo ?? 'Desconhecido',
                        'estado'       => $p->estado ?? 'ausente',
                    ])->sortBy('nome_atleta')->values()->all());
                } else {
                    $training->setAttribute('presencas_grupo', []);
                }

                return $training;
            });

        $selectedTraining = null;
        if (request('training_id')) {
            $selectedTrainingQuery = Training::query()->with('series');

            if ($hasTrainingAgeGroupPivot) {
                $selectedTrainingQuery->with('ageGroups:id');
            }

            $selectedTraining = $selectedTrainingQuery->find(request('training_id'));
        }

        if ($selectedTraining) {
            $selectedEscaloes = $hasTrainingAgeGroupPivot
                ? $selectedTraining->ageGroups->pluck('id')->values()->all()
                : (array) ($selectedTraining->escaloes ?? []);

            $selectedTraining->setAttribute('escaloes', $selectedEscaloes);
        }

        $presences = collect();
        if ($selectedTraining) {
            $presences = $selectedTraining->athleteRecords()
                ->with(['atleta'])
                ->get()
                ->map(function (TrainingAthlete $p) use ($selectedTraining) {
                    return [
                        'id' => $p->id,
                        'legacy_presence_id' => null,
                        'user_id' => $p->user_id,
                        'nome_atleta' => $p->atleta?->nome_completo,
                        'data' => Carbon::parse($selectedTraining->data)->toDateString(),
                        'status' => $p->estado,
                        'distancia_realizada_m' => $p->volume_real_m,
                        'classificacao' => null,
                        'notas' => $p->observacoes_tecnicas,
                    ];
                });
        }

        // Competições persistidas
        $persistedCompetitions = Competition::query()
            ->orderByDesc('data_inicio')
            ->get(['id', 'nome', 'data_inicio', 'local', 'tipo', 'evento_id'])
            ->map(fn ($row) => [
                'id' => $row->id,
                'titulo' => $row->nome,
                'data_inicio' => $row->data_inicio,
                'local' => $row->local,
                'tipo' => $row->tipo,
                'evento_id' => $row->evento_id,
            ]);

        $linkedEventIds = $persistedCompetitions
            ->pluck('evento_id')
            ->filter()
            ->values();

        // Fallback: eventos de prova ainda não sincronizados para competitions
        $orphanEventCompetitions = Event::query()
            ->where('tipo', 'prova')
            ->when($linkedEventIds->isNotEmpty(), fn ($q) => $q->whereNotIn('id', $linkedEventIds))
            ->get(['id', 'titulo', 'data_inicio', 'local', 'tipo'])
            ->map(fn ($event) => [
                'id' => $event->id,
                'titulo' => $event->titulo,
                'data_inicio' => $event->data_inicio,
                'local' => $event->local,
                'tipo' => $event->tipo,
                'evento_id' => $event->id,
            ]);

        $competitions = $persistedCompetitions
            ->concat($orphanEventCompetitions)
            ->sortByDesc(fn ($item) => (string) ($item['data_inicio'] ?? ''))
            ->values();

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
            ])
            ->map(function (User $user) {
                $user->escalao = $user->athleteSportsData?->escalao_id
                    ? [(string) $user->athleteSportsData->escalao_id]
                    : [];

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
        $convocationGroups = ConvocationGroup::with([
                'evento:id,titulo,data_inicio,tipo',
                'convocationAthletes.atleta:id,nome_completo',
            ])
            ->orderByDesc('data_criacao')
            ->get()
            ->map(function (ConvocationGroup $group) {
                return [
                    'id' => $group->id,
                    'evento_id' => $group->evento_id,
                    'evento_titulo' => $group->evento?->titulo,
                    'evento_data' => $group->evento?->data_inicio,
                    'atletas_ids' => $group->atletas_ids ?? [],
                    'hora_encontro' => $group->hora_encontro,
                    'local_encontro' => $group->local_encontro,
                    'observacoes' => $group->observacoes,
                    'athletes' => $group->convocationAthletes->map(function (ConvocationAthlete $athlete) {
                        return [
                            'atleta_id' => $athlete->atleta_id,
                            'atleta_nome' => $athlete->atleta?->nome_completo,
                            'provas' => $athlete->provas ?? [],
                            'estafetas' => $athlete->estafetas,
                            'presente' => $athlete->presente,
                            'confirmado' => $athlete->confirmado,
                        ];
                    })->values(),
                ];
            })
            ->values();
        $provaTipos = ProvaTipo::query()
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn ($provaTipo) => [
                'id' => $provaTipo->id,
                'nome' => $provaTipo->nome,
            ])
            ->values();
        $attendances = collect();

        $results = Result::with(['prova.competition', 'athlete'])
            ->orderByDesc('created_at')
            ->limit(100)
            ->get()
            ->map(fn ($result) => [
                'id' => $result->id,
                'prova' => trim(($result->prova?->distancia_m ?? 0) . 'm ' . ($result->prova?->estilo ?? '')),
                'tempo' => $result->tempo_oficial,
                'classificacao' => $result->posicao,
                'event' => $result->prova?->competition
                    ? [
                        'id' => $result->prova->competition->id,
                        'titulo' => $result->prova->competition->nome,
                    ]
                    : null,
                'athlete' => $result->athlete
                    ? ['nome_completo' => $result->athlete->nome_completo]
                    : null,
            ]);

        $teamResults = TeamResult::query()
            ->orderByDesc('created_at')
            ->limit(100)
            ->get(['id', 'competicao_id', 'equipa', 'classificacao', 'pontos', 'observacoes'])
            ->map(fn ($row) => [
                'id' => $row->id,
                'competicao_id' => $row->competicao_id,
                'equipa' => $row->equipa,
                'classificacao' => $row->classificacao,
                'pontos' => $row->pontos,
                'observacoes' => $row->observacoes,
            ]);

        $seasonStart = $activeSeason?->data_inicio ?? $now->copy()->startOfYear();

        $volumeByAthlete = DB::table('training_athletes')
            ->join('trainings', 'training_athletes.treino_id', '=', 'trainings.id')
            ->join('users', 'training_athletes.user_id', '=', 'users.id')
            ->where('trainings.data', '>=', $seasonStart)
            ->where(function ($q) {
                $q->where('training_athletes.estado', 'presente')
                  ->orWhere('training_athletes.presente', true);
            })
            ->select('users.nome_completo', DB::raw('SUM(COALESCE(trainings.volume_planeado_m, 0)) as total_m'))
            ->groupBy('users.id', 'users.nome_completo')
            ->orderByDesc('total_m')
            ->get();

        $attendanceSummaryByUser = DB::table('training_athletes')
            ->join('trainings', 'training_athletes.treino_id', '=', 'trainings.id')
            ->where('trainings.data', '>=', $seasonStart)
            ->select(
                'training_athletes.user_id',
                DB::raw('COUNT(*) as total_registos'),
                DB::raw("COUNT(CASE WHEN training_athletes.estado = 'presente' THEN 1 END) as total_presentes"),
                DB::raw("COUNT(CASE WHEN training_athletes.estado = 'ausente' THEN 1 END) as total_ausentes")
            )
            ->groupBy('training_athletes.user_id')
            ->get()
            ->keyBy('user_id');

        $bestResultsByUser = DB::table('results')
            ->whereNotNull('user_id')
            ->select(
                'user_id',
                DB::raw('MIN(posicao) as melhor_classificacao'),
                DB::raw('COUNT(*) as total_resultados')
            )
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        $athleteOperationalRows = collect($eventUsers)
            ->filter(function (User $user) {
                return $user->estado === 'ativo' && in_array('atleta', $user->tipo_membro ?? [], true);
            })
            ->map(function (User $user) use ($attendanceSummaryByUser, $bestResultsByUser) {
                $attendance = $attendanceSummaryByUser->get($user->id);
                $results = $bestResultsByUser->get($user->id);

                $totalRegistos = (int) ($attendance->total_registos ?? 0);
                $presentes = (int) ($attendance->total_presentes ?? 0);
                $ausentes = (int) ($attendance->total_ausentes ?? 0);

                $assiduidadePercent = $totalRegistos > 0
                    ? (int) round(($presentes / $totalRegistos) * 100)
                    : null;

                $disciplinaStatus = 'ok';
                if ($totalRegistos > 0) {
                    $ausenciaPercent = ($ausentes / $totalRegistos) * 100;
                    if ($ausenciaPercent >= 30) {
                        $disciplinaStatus = 'atencao';
                    }
                    if ($ausenciaPercent >= 45) {
                        $disciplinaStatus = 'critico';
                    }
                }

                return [
                    'user_id' => $user->id,
                    'assiduidade_percent' => $assiduidadePercent,
                    'disciplina_status' => $disciplinaStatus,
                    'pb_label' => ($results && $results->melhor_classificacao)
                        ? '#' . (int) $results->melhor_classificacao
                        : null,
                    'total_resultados' => (int) ($results->total_resultados ?? 0),
                ];
            })
            ->values();

        $reportAttendanceByGroup = DB::table('training_athletes')
            ->join('trainings', 'training_athletes.treino_id', '=', 'trainings.id')
            ->join('athlete_sports_data', 'training_athletes.user_id', '=', 'athlete_sports_data.user_id')
            ->leftJoin('age_groups', 'athlete_sports_data.escalao_id', '=', 'age_groups.id')
            ->where('trainings.data', '>=', $seasonStart)
            ->select('age_groups.nome',
                DB::raw("COUNT(CASE WHEN training_athletes.estado = 'presente' THEN 1 END) as presentes"),
                DB::raw("COUNT(CASE WHEN training_athletes.estado = 'ausente' THEN 1 END) as ausentes"),
                DB::raw('COUNT(*) as total'),
                DB::raw("ROUND(COUNT(CASE WHEN training_athletes.estado = 'presente' THEN 1 END) * 100.0 / NULLIF(COUNT(*),0), 2) as percentagem"))
            ->groupBy('age_groups.id', 'age_groups.nome')
            ->get();

        $competitionStats = Competition::query()
            ->where('data_inicio', '>=', $seasonStart)
            ->withCount('results')
            ->orderByDesc('data_inicio')
            ->get();

        $sportsFinancialTotal = (float) DB::table('movements')
            ->where('data_emissao', '>=', $seasonStart)
            ->where(function ($query) {
                $query->where('origem_tipo', 'evento')
                    ->orWhere('tipo', 'inscricao');
            })
            ->sum(DB::raw('ABS(valor_total)'));

        $totalDistanceMeters = (float) DB::table('training_athletes')
            ->join('trainings', 'training_athletes.treino_id', '=', 'trainings.id')
            ->where('trainings.data', '>=', $seasonStart)
            ->sum(DB::raw('COALESCE(training_athletes.volume_real_m, 0)'));

        $totalDistanceKm = $totalDistanceMeters / 1000;
        $costPerKm = $totalDistanceKm > 0 ? $sportsFinancialTotal / $totalDistanceKm : null;

        return Inertia::render($view, [
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
            'mesocycles' => $mesocycles,
            'microcycles' => $microcycles,
            'ageGroups' => AgeGroup::all(),
            'tiposEpoca' => ['Principal', 'Secundária', 'Época de Verão', 'Preparação', 'Pré-Época'],
            'estadosEpoca' => ['Planeada', 'Em curso', 'Concluída', 'Arquivada'],
            'tiposMacrociclo' => ['Preparação geral', 'Preparação específica', 'Competição', 'Taper', 'Transição'],
            'trainingTypeOptions' => TrainingTypeConfig::query()
                ->where('ativo', true)
                ->orderBy('ordem')
                ->orderBy('nome')
                ->get(['id', 'nome'])
                ->map(fn ($item) => [
                    'id' => $item->id,
                    'nome' => $item->nome,
                ])
                ->values(),
            'trainingZoneOptions' => TrainingZoneConfig::query()
                ->where('ativo', true)
                ->orderBy('ordem')
                ->orderBy('nome')
                ->get(['id', 'codigo', 'nome'])
                ->map(fn ($item) => [
                    'id' => $item->id,
                    'codigo' => $item->codigo,
                    'nome' => $item->nome,
                ])
                ->values(),
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
            'teamResults' => $teamResults,
            'volumeByAthlete' => $volumeByAthlete,
            'athleteOperationalRows' => $athleteOperationalRows,
            'reportAttendanceByGroup' => $reportAttendanceByGroup,
            'competitionStats' => $competitionStats,
            'eventos' => $eventos,
            'users' => $eventUsers,
            'costCenters' => $costCenters,
            'eventTypes' => $eventTypes,
            'convocations' => $convocations,
            'convocationGroups' => $convocationGroups,
            'provaTipos' => $provaTipos,
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
        $hasMacroObjectiveColumns = Schema::hasColumn('macrocycles', 'objetivo_principal')
            && Schema::hasColumn('macrocycles', 'objetivo_secundario');

        $validated = $request->validate([
            'epoca_id' => 'required|uuid|exists:seasons,id',
            'nome' => 'required|string|max:255',
            'tipo' => 'nullable|string|max:50',
            'data_inicio' => 'required|date',
            'data_fim' => 'required|date|after_or_equal:data_inicio',
            'objetivo_principal' => 'required|string|max:255',
            'objetivo_secundario' => 'nullable|string|max:255',
            'escalao' => 'nullable|string|max:255',
        ]);

        if (empty($validated['tipo'])) {
            $validated['tipo'] = 'Preparação geral';
        }

        if (!$hasMacroObjectiveColumns) {
            $validated['tipo'] = $validated['objetivo_principal'];
            unset($validated['objetivo_principal'], $validated['objetivo_secundario']);
        }

        Macrocycle::create($validated);

        return redirect()->route('desportivo.planeamento', ['season_id' => $validated['epoca_id']])
            ->with('success', 'Macrociclo criado com sucesso!');
    }

    public function updateMacrocycle(Request $request, Macrocycle $macrocycle): RedirectResponse
    {
        $hasMacroObjectiveColumns = Schema::hasColumn('macrocycles', 'objetivo_principal')
            && Schema::hasColumn('macrocycles', 'objetivo_secundario');

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'tipo' => 'nullable|string|max:50',
            'data_inicio' => 'required|date',
            'data_fim' => 'required|date|after_or_equal:data_inicio',
            'objetivo_principal' => 'required|string|max:255',
            'objetivo_secundario' => 'nullable|string|max:255',
            'escalao' => 'nullable|string|max:255',
        ]);

        if (empty($validated['tipo'])) {
            $validated['tipo'] = $macrocycle->tipo ?: 'Preparação geral';
        }

        if (!$hasMacroObjectiveColumns) {
            $validated['tipo'] = $validated['objetivo_principal'];
            unset($validated['objetivo_principal'], $validated['objetivo_secundario']);
        }

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

    public function storeMesocycle(Request $request): RedirectResponse
    {
        $hasMesocycleObjectiveColumns = Schema::hasColumn('mesocycles', 'objetivo_principal')
            && Schema::hasColumn('mesocycles', 'objetivo_secundario');

        $validated = $request->validate([
            'epoca_id' => 'required|uuid|exists:seasons,id',
            'macrociclo_id' => 'required|uuid|exists:macrocycles,id',
            'nome' => 'required|string|max:255',
            'data_inicio' => 'required|date',
            'data_fim' => 'required|date|after_or_equal:data_inicio',
            'objetivo_principal' => 'required|string|max:255',
            'objetivo_secundario' => 'nullable|string|max:255',
        ]);

        $payload = [
            'macrociclo_id' => $validated['macrociclo_id'],
            'nome' => $validated['nome'],
            'foco' => $validated['objetivo_principal'],
            'data_inicio' => $validated['data_inicio'],
            'data_fim' => $validated['data_fim'],
        ];

        if ($hasMesocycleObjectiveColumns) {
            $payload['objetivo_principal'] = $validated['objetivo_principal'];
            $payload['objetivo_secundario'] = $validated['objetivo_secundario'] ?? null;
        }

        Mesocycle::create($payload);

        return redirect()->route('desportivo.planeamento', ['season_id' => $validated['epoca_id']])
            ->with('success', 'Mesociclo criado com sucesso!');
    }

    public function updateMesocycle(Request $request, Mesocycle $mesocycle): RedirectResponse
    {
        $hasMesocycleObjectiveColumns = Schema::hasColumn('mesocycles', 'objetivo_principal')
            && Schema::hasColumn('mesocycles', 'objetivo_secundario');

        $validated = $request->validate([
            'epoca_id' => 'required|uuid|exists:seasons,id',
            'macrociclo_id' => 'required|uuid|exists:macrocycles,id',
            'nome' => 'required|string|max:255',
            'data_inicio' => 'required|date',
            'data_fim' => 'required|date|after_or_equal:data_inicio',
            'objetivo_principal' => 'required|string|max:255',
            'objetivo_secundario' => 'nullable|string|max:255',
        ]);

        $payload = [
            'macrociclo_id' => $validated['macrociclo_id'],
            'nome' => $validated['nome'],
            'foco' => $validated['objetivo_principal'],
            'data_inicio' => $validated['data_inicio'],
            'data_fim' => $validated['data_fim'],
        ];

        if ($hasMesocycleObjectiveColumns) {
            $payload['objetivo_principal'] = $validated['objetivo_principal'];
            $payload['objetivo_secundario'] = $validated['objetivo_secundario'] ?? null;
        }

        $mesocycle->update($payload);

        return redirect()->route('desportivo.planeamento', ['season_id' => $validated['epoca_id']])
            ->with('success', 'Mesociclo atualizado com sucesso!');
    }

    public function deleteMesocycle(Request $request, Mesocycle $mesocycle): RedirectResponse
    {
        $validated = $request->validate([
            'epoca_id' => 'required|uuid|exists:seasons,id',
        ]);

        $mesocycle->delete();

        return redirect()->route('desportivo.planeamento', ['season_id' => $validated['epoca_id']])
            ->with('success', 'Mesociclo eliminado com sucesso!');
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
    public function storeTraining(StoreTrainingRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        app(CreateTrainingAction::class)->execute($validated, auth()->user());

        return redirect()->route('desportivo.treinos')
            ->with('success', 'Treino criado com sucesso!');
    }

    /**
     * Schedule a training from library template into a dated session.
     */
    public function scheduleTraining(ScheduleTrainingRequest $request, Training $training): RedirectResponse
    {
        if (!empty($training->data)) {
            return redirect()->route('desportivo.treinos')
                ->with('error', 'Apenas treinos da biblioteca podem ser agendados.');
        }

        $validated = $request->validated();

        $payload = [
            'numero_treino' => $training->numero_treino,
            'data' => $validated['data'],
            'hora_inicio' => $validated['hora_inicio'],
            'hora_fim' => $validated['hora_fim'] ?? null,
            'local' => $validated['local'] ?? $training->local,
            'epoca_id' => $validated['epoca_id'] ?? $training->epoca_id,
            'microciclo_id' => $validated['microciclo_id'] ?? $training->microciclo_id,
            'tipo_treino' => $training->tipo_treino,
            'volume_planeado_m' => $training->volume_planeado_m,
            'descricao_treino' => $training->descricao_treino,
            'notas_gerais' => $training->notas_gerais,
            'escaloes' => $validated['escaloes'],
            'series_linhas' => $this->mapSeriesRowsFromTemplate($training),
        ];

        if (Schema::hasColumn('trainings', 'macrocycle_id')) {
            $payload['macrocycle_id'] = $validated['macrocycle_id'] ?? null;
        }

        $scheduledTraining = app(CreateTrainingAction::class)->execute($payload, auth()->user());

        $event = Event::create([
            'titulo' => sprintf('Treino %s', $scheduledTraining->numero_treino ?? ''),
            'descricao' => $scheduledTraining->descricao_treino ?: 'Treino agendado via módulo Desportivo',
            'data_inicio' => $scheduledTraining->data,
            'hora_inicio' => $scheduledTraining->hora_inicio,
            'data_fim' => $scheduledTraining->data,
            'hora_fim' => $scheduledTraining->hora_fim,
            'local' => $scheduledTraining->local,
            'tipo' => 'treino',
            'visibilidade' => 'restrito',
            'estado' => 'agendado',
            'criado_por' => auth()->id(),
        ]);

        $event->syncAgeGroups($validated['escaloes']);

        $scheduledTraining->update(['evento_id' => $event->id]);

        return redirect()->route('desportivo.treinos')
            ->with('success', 'Treino agendado com sucesso!');
    }

    /**
     * Update Training
     */
    public function updateTraining(UpdateTrainingRequest $request, Training $training): RedirectResponse
    {
        $validated = $request->validated();

        $training->update(collect($validated)->except('escaloes')->all());

        if (Schema::hasTable('training_age_group')) {
            $training->syncAgeGroupsWithPivot($validated['escaloes'] ?? []);
        }

        app(PrepareTrainingAthletesAction::class)
            ->updateForChangedEscaloes($training->fresh(), $validated['escaloes'] ?? []);

        // Sync the linked Event if one exists
        if ($training->evento_id) {
            $event = Event::find($training->evento_id);
            if ($event) {
                $event->update([
                    'titulo'      => sprintf('Treino %s', $validated['numero_treino'] ?? $training->numero_treino ?? ''),
                    'data_inicio' => $validated['data'] ?? $event->data_inicio,
                    'data_fim'    => $validated['data'] ?? $event->data_fim,
                    'hora_inicio' => $validated['hora_inicio'] ?? $event->hora_inicio,
                    'hora_fim'    => $validated['hora_fim'] ?? $event->hora_fim,
                    'local'       => $validated['local'] ?? $event->local,
                ]);
                if (!empty($validated['escaloes'])) {
                    $event->syncAgeGroups($validated['escaloes']);
                }
            }
        }

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
            'escaloes' => Schema::hasTable('training_age_group')
                ? $training->ageGroups()->pluck('age_groups.id')->all()
                : (array) ($training->escaloes ?? []),
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
            $linkedEventId = $training->evento_id;
            $training->delete();
            if ($linkedEventId) {
                Event::where('id', $linkedEventId)->delete();
            }
        });

        return redirect()->route('desportivo.treinos')
            ->with('success', 'Treino eliminado com sucesso!');
    }

    /**
     * Update presence statuses for a specific training (inline, redirects to treinos).
     */
    public function updateTrainingPresencas(Request $request, Training $training): RedirectResponse
    {
        $validated = $request->validate([
            'presencas'          => 'required|array',
            'presencas.*.id'     => 'required|uuid',
            'presencas.*.estado' => 'required|in:presente,ausente,dispensado',
        ]);

        $updateAction = app(UpdateTrainingAthleteAction::class);

        foreach ($validated['presencas'] as $row) {
            $pa = TrainingAthlete::find($row['id']);
            if ($pa && $pa->treino_id === $training->id) {
                $updateAction->execute($pa, ['estado' => $row['estado']], auth()->user());

                if ($training->evento_id) {
                    EventAttendance::where('evento_id', $training->evento_id)
                        ->where('user_id', $pa->user_id)
                        ->update(['estado' => $row['estado']]);
                }
            }
        }

        return redirect()->route('desportivo.treinos')
            ->with('success', 'Presenças atualizadas!');
    }

    /**
     * Add an athlete to a training's presence group.
     */
    public function addAthleteToTraining(Request $request, Training $training): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|uuid|exists:users,id',
        ]);

        $exists = TrainingAthlete::where('treino_id', $training->id)
            ->where('user_id', $validated['user_id'])
            ->exists();

        if (!$exists) {
            $trainingAthlete = TrainingAthlete::create([
                'treino_id'      => $training->id,
                'user_id'        => $validated['user_id'],
                'presente'       => false,
                'estado'         => 'ausente',
                'registado_por'  => auth()->id(),
                'registado_em'   => now(),
            ]);

            if ($training->evento_id) {
                EventAttendance::firstOrCreate(
                    [
                        'evento_id' => $training->evento_id,
                        'user_id' => $validated['user_id'],
                    ],
                    [
                        'estado' => 'ausente',
                        'synced_from_training' => true,
                        'training_athlete_id' => $trainingAthlete->id,
                        'registado_por' => auth()->id(),
                        'registado_em' => now(),
                    ]
                );
            }
        }

        return redirect()->route('desportivo.treinos')
            ->with('success', 'Atleta adicionado ao grupo de presenças!');
    }

    /**
     * Remove an athlete from a training's presence group.
     */
    public function removeAthleteFromTraining(Training $training, User $user): RedirectResponse
    {
        TrainingAthlete::where('treino_id', $training->id)
            ->where('user_id', $user->id)
            ->delete();

        if ($training->evento_id) {
            EventAttendance::where('evento_id', $training->evento_id)
                ->where('user_id', $user->id)
                ->delete();
        }

        return redirect()->route('desportivo.treinos')
            ->with('success', 'Atleta removido do grupo de presenças!');
    }

    private function mapSeriesRowsFromTemplate(Training $training): array
    {
        return $training->series
            ->map(function ($seriesRow) {
                $distance = (int) ($seriesRow->distancia_total_m ?? 0);
                $repeticoes = (int) ($seriesRow->repeticoes ?? 0);

                $metros = 0;
                if ($distance > 0) {
                    if ($repeticoes > 0 && $distance % $repeticoes === 0) {
                        $metros = (int) ($distance / $repeticoes);
                    } else {
                        $metros = $distance;
                    }
                }

                return [
                    'repeticoes' => $repeticoes,
                    'exercicio' => (string) ($seriesRow->descricao_texto ?? ''),
                    'metros' => $metros,
                    'zona' => (string) ($seriesRow->zona_intensidade ?? ''),
                ];
            })
            ->values()
            ->all();
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
            'presences.*.status' => 'required|in:presente,ausente,justificado,atestado_medico,outro,lesionado,limitado,doente,dispensado',
            'presences.*.distancia_realizada_m' => 'nullable|integer',
            'presences.*.classificacao' => 'nullable|string',
            'presences.*.notas' => 'nullable|string',
        ]);

        $updateAction = app(UpdateTrainingAthleteAction::class);

        foreach ($validated['presences'] as $presenceData) {
            $trainingAthlete = TrainingAthlete::find($presenceData['id']);

            if (!$trainingAthlete) {
                continue;
            }

            $updateAction->execute($trainingAthlete, [
                'estado' => $presenceData['status'] === 'atestado_medico' ? 'justificado' : $presenceData['status'],
                'volume_real_m' => $presenceData['distancia_realizada_m'] ?? null,
                'observacoes_tecnicas' => $presenceData['notas'] ?? null,
            ], auth()->user());
        }

        return redirect()->back()
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

        return redirect()->back()
            ->with('success', 'Todos os atletas foram marcados como presentes!');
    }

    /**
     * Clear all presences
     */
    public function clearAllPresences(Request $request): RedirectResponse
    {
        $trainingId = $request->input('training_id');

        app(UpdateTrainingAthleteAction::class)->clearAllPresences($trainingId, auth()->user());

        return redirect()->back()
            ->with('success', 'Classificações removidas!');
    }

    /**
     * Obter métricas de Cais para um atleta num treino
     */
    public function getCaisMetrics(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'treino_id' => 'required|uuid|exists:trainings,id',
            'user_id' => 'required|uuid|exists:users,id',
        ]);

        $isAssigned = TrainingAthlete::query()
            ->where('treino_id', $validated['treino_id'])
            ->where('user_id', $validated['user_id'])
            ->exists();

        if (!$isAssigned) {
            return response()->json([
                'message' => 'Atleta não elegível para este treino.',
            ], 422);
        }

        $rows = TrainingMetric::query()
            ->where('treino_id', $validated['treino_id'])
            ->where('user_id', $validated['user_id'])
            ->orderBy('ordem')
            ->get()
            ->map(function (TrainingMetric $row) {
                return [
                    'id' => $row->id,
                    'metrica' => (string) ($row->metrica ?? ''),
                    'valor' => (string) ($row->valor ?? ''),
                    'tempo' => (string) ($row->tempo ?? ''),
                    'observacao' => (string) ($row->observacao ?? ''),
                ];
            })
            ->values();

        return response()->json([
            'rows' => $rows,
        ]);
    }

    /**
     * Persistir métricas de Cais para um atleta num treino
     */
    public function storeCaisMetrics(StoreTrainingMetricRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $isAssigned = TrainingAthlete::query()
            ->where('treino_id', $validated['treino_id'])
            ->where('user_id', $validated['user_id'])
            ->exists();

        if (!$isAssigned) {
            return response()->json([
                'message' => 'Atleta não elegível para este treino.',
            ], 422);
        }

        $normalizedRows = collect($validated['rows'])
            ->map(function (array $row) {
                return [
                    'metrica' => $this->normalizeCaisMetricValue($row['metrica'] ?? null),
                    'valor' => $this->normalizeCaisMetricValue($row['valor'] ?? null),
                    'tempo' => $this->normalizeCaisMetricValue($row['tempo'] ?? null),
                    'observacao' => $this->normalizeCaisMetricValue($row['observacao'] ?? null),
                ];
            })
            ->filter(function (array $row) {
                return $row['metrica'] !== null
                    || $row['valor'] !== null
                    || $row['tempo'] !== null
                    || $row['observacao'] !== null;
            })
            ->values();

        $authId = auth()->id();

        DB::transaction(function () use ($validated, $normalizedRows, $authId) {
            TrainingMetric::query()
                ->where('treino_id', $validated['treino_id'])
                ->where('user_id', $validated['user_id'])
                ->delete();

            foreach ($normalizedRows as $index => $row) {
                TrainingMetric::create([
                    'treino_id' => $validated['treino_id'],
                    'user_id' => $validated['user_id'],
                    'ordem' => $index + 1,
                    'metrica' => $row['metrica'],
                    'valor' => $row['valor'],
                    'tempo' => $row['tempo'],
                    'observacao' => $row['observacao'],
                    'registado_por' => $authId,
                    'atualizado_por' => $authId,
                ]);
            }
        });

        $rows = TrainingMetric::query()
            ->where('treino_id', $validated['treino_id'])
            ->where('user_id', $validated['user_id'])
            ->orderBy('ordem')
            ->get()
            ->map(function (TrainingMetric $row) {
                return [
                    'id' => $row->id,
                    'metrica' => (string) ($row->metrica ?? ''),
                    'valor' => (string) ($row->valor ?? ''),
                    'tempo' => (string) ($row->tempo ?? ''),
                    'observacao' => (string) ($row->observacao ?? ''),
                ];
            })
            ->values();

        return response()->json([
            'message' => 'Métricas de Cais guardadas com sucesso.',
            'rows' => $rows,
        ]);
    }

    private function normalizeCaisMetricValue(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
