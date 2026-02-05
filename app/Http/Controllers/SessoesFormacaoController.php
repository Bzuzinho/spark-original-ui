<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTrainingSessionRequest;
use App\Http\Requests\UpdateTrainingSessionRequest;
use App\Models\TrainingSession;
use App\Models\Team;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SessoesFormacaoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Desportivo/TrainingSessions/Index', [
            'trainingSessions' => TrainingSession::with('team')
                ->latest('datetime')
                ->paginate(15),
            'teams' => Team::where('ativo', true)->get(['id', 'nome']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Desportivo/TrainingSessions/Create', [
            'teams' => Team::where('ativo', true)->get(['id', 'nome']),
        ]);
    }

    public function store(StoreTrainingSessionRequest $request): RedirectResponse
    {
        TrainingSession::create($request->validated());

        return redirect()->route('training-sessions.index')
            ->with('success', 'Treino criado com sucesso!');
    }

    public function show(TrainingSession $trainingSession): Response
    {
        return Inertia::render('Desportivo/TrainingSessions/Show', [
            'trainingSession' => $trainingSession->load('team'),
        ]);
    }

    public function edit(TrainingSession $trainingSession): Response
    {
        return Inertia::render('Desportivo/TrainingSessions/Edit', [
            'trainingSession' => $trainingSession,
            'teams' => Team::where('ativo', true)->get(['id', 'nome']),
        ]);
    }

    public function update(UpdateTrainingSessionRequest $request, TrainingSession $trainingSession): RedirectResponse
    {
        $trainingSession->update($request->validated());

        return redirect()->route('training-sessions.index')
            ->with('success', 'Treino atualizado com sucesso!');
    }

    public function destroy(TrainingSession $trainingSession): RedirectResponse
    {
        $trainingSession->delete();

        return redirect()->route('training-sessions.index')
            ->with('success', 'Treino eliminado com sucesso!');
    }
}
