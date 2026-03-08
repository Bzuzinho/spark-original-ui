<?php

namespace App\Http\Controllers;

use App\Models\AgeGroup;
use App\Models\Season;
use App\Models\Macrocycle;
use App\Models\Training;
use App\Models\Presence;
use App\Models\Event;
use App\Models\EventResult;
use App\Models\User;
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
        return $this->renderSportsPage('presencas');
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

        $lowAttendance = (clone $athletesQuery)
            ->where('estado', 'ativo')
            ->get()
            ->filter(function ($user) use ($thirtyDaysAgo) {
                $presenceCount = Presence::where('user_id', $user->id)
                    ->where('data', '>=', $thirtyDaysAgo->format('Y-m-d'))
                    ->where('status', 'presente')
                    ->count();

                $trainings = Training::where('data', '>=', $thirtyDaysAgo->format('Y-m-d'))->count();

                return $trainings > 0 && ($presenceCount / $trainings) < 0.5;
            });

        if ($lowAttendance->count() > 0) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Atletas com Baixa Presença',
                'message' => $lowAttendance->count() . ' atletas com presença inferior a 50%',
                'count' => $lowAttendance->count(),
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

        $seasons = Season::orderByDesc('data_inicio')->get();
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
            $presences = $selectedTraining->presences()
                ->with(['atleta', 'escalao'])
                ->get()
                ->map(function (Presence $p) {
                    return [
                        'id' => $p->id,
                        'user_id' => $p->user_id,
                        'nome_atleta' => $p->atleta?->nome_completo,
                        'data' => $p->data,
                        'status' => $p->status,
                        'distancia_realizada_m' => $p->distancia_realizada_m,
                        'classificacao' => $p->classificacao,
                        'notas' => $p->notas,
                    ];
                });
        }

        $competitions = Event::where('tipo', 'prova')
            ->orderByDesc('data_inicio')
            ->get(['id', 'titulo', 'data_inicio', 'local', 'tipo']);

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
            'statusOptions' => ['presente', 'ausente', 'justificado', 'atestado_medico', 'outro'],
            'classificacaoOptions' => ['Excelente', 'Bom', 'Satisfatório', 'Fraco'],
            'competitions' => $competitions,
            'results' => $results,
            'volumeByAthlete' => $volumeByAthlete,
            'reportAttendanceByGroup' => $reportAttendanceByGroup,
            'competitionStats' => $competitionStats,
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

        $training = Training::create([
            ...$validated,
            'criado_por' => auth()->id(),
            'escaloes' => $validated['escaloes'] ?? [],
        ]);

        $escaloes = $validated['escaloes'] ?? [];
        $escaloesNomes = !empty($escaloes)
            ? AgeGroup::whereIn('id', $escaloes)->pluck('nome')->implode(', ')
            : 'Treino';

        $event = Event::create([
            'titulo' => "Treino - {$escaloesNomes}",
            'data_inicio' => Carbon::parse($validated['data'])->toDateString(),
            'hora_inicio' => $validated['hora_inicio'] ?? '09:00',
            'data_fim' => $validated['data'],
            'hora_fim' => $validated['hora_fim'] ?? '10:00',
            'tipo' => 'treino',
            'descricao' => $validated['descricao_treino'],
            'local' => $validated['local'],
            'estado' => 'agendado',
            'criado_por' => auth()->id(),
        ]);

        if (!empty($escaloes)) {
            $event->syncAgeGroups($escaloes);
        }

        $training->update(['evento_id' => $event->id]);

        if (!empty($escaloes)) {
            $athletesQuery = User::whereJsonContains('tipo_membro', 'atleta')
                ->where('estado', 'ativo')
                ->where(function ($query) use ($escaloes) {
                    foreach ($escaloes as $escalaoId) {
                        $query->orWhereJsonContains('escalao', $escalaoId);
                    }
                });

            $athletes = $athletesQuery->get();

            foreach ($athletes as $athlete) {
                $athleteEscaloes = $athlete->escalao;
                if (!is_array($athleteEscaloes)) {
                    $athleteEscaloes = $athleteEscaloes ? [$athleteEscaloes] : [];
                }

                $matchedEscaloes = array_values(array_intersect($escaloes, $athleteEscaloes));
                $escalaoId = $matchedEscaloes[0] ?? null;

                Presence::create([
                    'user_id' => $athlete->id,
                    'data' => $validated['data'],
                    'treino_id' => $training->id,
                    'escalao_id' => $escalaoId,
                    'tipo' => 'treino',
                    'status' => 'ausente',
                    'presente' => false,
                ]);
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

        return redirect()->route('desportivo.treinos')
            ->with('success', 'Treino atualizado com sucesso!');
    }

    /**
     * Duplicate Training
     */
    public function duplicateTraining(Training $training): RedirectResponse
    {
        $newTraining = $training->replicate();
        $newTraining->data = Carbon::parse($training->data)->addDays(7)->format('Y-m-d');
        $newTraining->save();

        return redirect()->route('desportivo.treinos')
            ->with('success', 'Treino duplicado com sucesso!');
    }

    /**
     * Delete Training
     */
    public function deleteTraining(Training $training): RedirectResponse
    {
        $training->presences()->delete();
        if ($training->evento_id) {
            Event::where('id', $training->evento_id)->delete();
        }
        $training->delete();

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
            'presences.*.id' => 'required|uuid|exists:presences,id',
            'presences.*.status' => 'required|in:presente,ausente,justificado,atestado_medico,outro',
            'presences.*.distancia_realizada_m' => 'nullable|integer',
            'presences.*.classificacao' => 'nullable|string',
            'presences.*.notas' => 'nullable|string',
        ]);

        foreach ($validated['presences'] as $presenceData) {
            $presence = Presence::find($presenceData['id']);
            if (!$presence) {
                continue;
            }

            $presence->update([
                'status' => $presenceData['status'],
                'distancia_realizada_m' => $presenceData['distancia_realizada_m'] ?? null,
                'classificacao' => $presenceData['classificacao'] ?? null,
                'notas' => $presenceData['notas'] ?? null,
                'presente' => $presenceData['status'] === 'presente',
            ]);
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
        
        Presence::where('treino_id', $trainingId)
            ->update([
                'status' => 'presente',
                'presente' => true,
            ]);

        return redirect()->route('desportivo.presencas')
            ->with('success', 'Todos os atletas foram marcados como presentes!');
    }

    /**
     * Clear all presences
     */
    public function clearAllPresences(Request $request): RedirectResponse
    {
        $trainingId = $request->input('training_id');
        
        Presence::where('treino_id', $trainingId)
            ->update([
                'status' => 'ausente',
                'presente' => false,
                'distancia_realizada_m' => null,
                'classificacao' => null,
                'notas' => null,
            ]);

        return redirect()->route('desportivo.presencas')
            ->with('success', 'Classificações removidas!');
    }
}
