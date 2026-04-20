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
use App\Services\Desportivo\DesportivoPagePayloadBuilder;
use App\Services\Desportivo\PrepareTrainingAthletesAction;
use App\Services\Desportivo\UpdateTrainingAthleteAction;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class DesportivoController extends Controller
{
    /**
     * Dashboard - Statísticas gerais do módulo desportivo
     */
    public function index(): Response
    {
        $tab = request()->string('tab')->toString();

        return $this->renderSportsPage(in_array($tab, ['dashboard', 'atletas'], true) ? $tab : 'dashboard');
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
        return $this->renderSportsPage('cais', 'Desportivo/Index', 'presencas');
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
        return $this->renderSportsPage('performance');
    }

    private function renderSportsPage(string $tab, string $view = 'Desportivo/Index', ?string $responseTab = null): Response
    {
        $builder = app(DesportivoPagePayloadBuilder::class);

        if ($this->isPlanningPartialRequest($tab, $view)) {
            $payload = $builder->buildPlanningPartial(request());

            if ($responseTab !== null) {
                $payload['tab'] = $responseTab;
            }

            return Inertia::render($view, $payload);
        }

        $payload = $builder->build($tab, request());

        if ($responseTab !== null) {
            $payload['tab'] = $responseTab;
        }

        return Inertia::render($view, $payload);
    }

    private function isPlanningPartialRequest(string $tab, string $view): bool
    {
        $partialDataHeader = (string) request()->header('X-Inertia-Partial-Data', '');
        $partialComponent = (string) request()->header('X-Inertia-Partial-Component', '');
        $requestedPartialKeys = collect(explode(',', $partialDataHeader))
            ->map(fn (string $key) => trim($key))
            ->filter();

        $planningPartialKeys = ['selectedSeason', 'macrocycles', 'mesocycles'];

        return $tab === 'planeamento'
            && $partialComponent === $view
            && $requestedPartialKeys->isNotEmpty()
            && $requestedPartialKeys->every(fn ($key) => in_array($key, $planningPartialKeys, true));
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

        if (Schema::hasColumn('trainings', 'mesociclo_id')) {
            $payload['mesociclo_id'] = $validated['mesociclo_id'] ?? null;
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

        $payload = collect($validated)->except('escaloes')->all();

        if (!Schema::hasColumn('trainings', 'macrocycle_id')) {
            unset($payload['macrocycle_id']);
        }

        if (!Schema::hasColumn('trainings', 'mesociclo_id')) {
            unset($payload['mesociclo_id']);
        }

        $training->update($payload);

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
