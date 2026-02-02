<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTrainingRequest;
use App\Http\Requests\UpdateTrainingRequest;
use App\Models\Training;
use App\Models\User;
use App\Models\AgeGroup;
use App\Models\Team;
use App\Models\TrainingSession;
use App\Models\Event;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon;

class SportsController extends Controller
{
    public function index(): Response
    {
        // Get stats for dashboard
        $now = Carbon::now();
        $sevenDaysAgo = $now->copy()->subDays(7);
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $thirtyDaysAhead = $now->copy()->addDays(30);

        $athletes = User::whereJsonContains('member_type', 'atleta')
            ->where('status', 'ativo')
            ->get(['id', 'full_name']);
        
        $activeTeams = Team::where('active', true)->count();
        
        $trainings7Days = TrainingSession::where('datetime', '>=', $sevenDaysAgo)
            ->where('datetime', '<=', $now)
            ->count();
            
        $trainings30Days = TrainingSession::where('datetime', '>=', $thirtyDaysAgo)
            ->where('datetime', '<=', $now)
            ->count();
            
        $upcomingEvents = Event::where('start_date', '>=', $now)
            ->where('start_date', '<=', $thirtyDaysAhead)
            ->count();

        return Inertia::render('Sports/Index', [
            'stats' => [
                'athletesCount' => $athletes->count(),
                'activeTeams' => $activeTeams,
                'trainings7Days' => $trainings7Days,
                'trainings30Days' => $trainings30Days,
                'upcomingEvents' => $upcomingEvents,
            ],
            'teams' => Team::with(['coach', 'members'])
                ->where('active', true)
                ->get(),
            'trainingSessions' => TrainingSession::with('team')
                ->where('datetime', '>=', $thirtyDaysAgo)
                ->latest('datetime')
                ->take(20)
                ->get(),
            'athletes' => $athletes,
            'events' => Event::where('start_date', '>=', $now)
                ->orderBy('start_date')
                ->take(10)
                ->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Sports/Create', [
            'ageGroups' => AgeGroup::all(),
            'athletes' => User::whereJsonContains('member_type', 'atleta')
                ->where('status', 'ativo')
                ->get(),
        ]);
    }

    public function store(StoreTrainingRequest $request): RedirectResponse
    {
        $training = Training::create($request->validated());

        if ($request->has('athletes')) {
            $training->athletes()->sync($request->athletes);
        }

        return redirect()->route('sports.index')
            ->with('success', 'Treino criado com sucesso!');
    }

    public function show(Training $desportivo): Response
    {
        return Inertia::render('Sports/Show', [
            'training' => $desportivo->load(['ageGroup', 'athletes']),
        ]);
    }

    public function edit(Training $desportivo): Response
    {
        return Inertia::render('Sports/Edit', [
            'training' => $desportivo->load(['ageGroup', 'athletes']),
            'ageGroups' => AgeGroup::all(),
            'athletes' => User::whereJsonContains('member_type', 'atleta')
                ->where('status', 'ativo')
                ->get(),
        ]);
    }

    public function update(UpdateTrainingRequest $request, Training $desportivo): RedirectResponse
    {
        $desportivo->update($request->validated());

        if ($request->has('athletes')) {
            $desportivo->athletes()->sync($request->athletes);
        }

        return redirect()->route('sports.index')
            ->with('success', 'Treino atualizado com sucesso!');
    }

    public function destroy(Training $desportivo): RedirectResponse
    {
        $desportivo->delete();

        return redirect()->route('sports.index')
            ->with('success', 'Treino eliminado com sucesso!');
    }
}
