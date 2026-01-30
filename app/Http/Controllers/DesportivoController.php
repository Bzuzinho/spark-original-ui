<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTrainingRequest;
use App\Http\Requests\UpdateTrainingRequest;
use App\Models\Training;
use App\Models\User;
use App\Models\AgeGroup;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class DesportivoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Desportivo/Index', [
            'trainings' => Training::with(['ageGroup', 'athletes'])
                ->latest()
                ->paginate(15),
            'ageGroups' => AgeGroup::all(),
            'athletes' => User::whereJsonContains('tipo_membro', 'atleta')
                ->where('estado', 'ativo')
                ->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Desportivo/Create', [
            'ageGroups' => AgeGroup::all(),
            'athletes' => User::whereJsonContains('tipo_membro', 'atleta')
                ->where('estado', 'ativo')
                ->get(),
        ]);
    }

    public function store(StoreTrainingRequest $request): RedirectResponse
    {
        $training = Training::create($request->validated());

        if ($request->has('athletes')) {
            $training->athletes()->sync($request->athletes);
        }

        return redirect()->route('desportivo.index')
            ->with('success', 'Treino criado com sucesso!');
    }

    public function show(Training $desportivo): Response
    {
        return Inertia::render('Desportivo/Show', [
            'training' => $desportivo->load(['ageGroup', 'athletes']),
        ]);
    }

    public function edit(Training $desportivo): Response
    {
        return Inertia::render('Desportivo/Edit', [
            'training' => $desportivo->load(['ageGroup', 'athletes']),
            'ageGroups' => AgeGroup::all(),
            'athletes' => User::whereJsonContains('tipo_membro', 'atleta')
                ->where('estado', 'ativo')
                ->get(),
        ]);
    }

    public function update(UpdateTrainingRequest $request, Training $desportivo): RedirectResponse
    {
        $desportivo->update($request->validated());

        if ($request->has('athletes')) {
            $desportivo->athletes()->sync($request->athletes);
        }

        return redirect()->route('desportivo.index')
            ->with('success', 'Treino atualizado com sucesso!');
    }

    public function destroy(Training $desportivo): RedirectResponse
    {
        $desportivo->delete();

        return redirect()->route('desportivo.index')
            ->with('success', 'Treino eliminado com sucesso!');
    }
}
