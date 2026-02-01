<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCallUpRequest;
use App\Http\Requests\UpdateCallUpRequest;
use App\Models\CallUp;
use App\Models\Team;
use App\Models\Event;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CallUpController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Desportivo/CallUps/Index', [
            'callUps' => CallUp::with(['event', 'team'])
                ->latest()
                ->paginate(15),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Desportivo/CallUps/Create', [
            'teams' => Team::where('ativa', true)->get(['id', 'nome']),
            'events' => Event::where('data_inicio', '>=', now())
                ->orderBy('data_inicio')
                ->get(['id', 'titulo', 'data_inicio']),
            'athletes' => User::whereJsonContains('tipo_membro', 'atleta')
                ->where('estado', 'ativo')
                ->get(['id', 'nome_completo']),
        ]);
    }

    public function store(StoreCallUpRequest $request): RedirectResponse
    {
        CallUp::create($request->validated());

        return redirect()->route('call-ups.index')
            ->with('success', 'Convocatória criada com sucesso!');
    }

    public function show(CallUp $callUp): Response
    {
        return Inertia::render('Desportivo/CallUps/Show', [
            'callUp' => $callUp->load(['event', 'team']),
        ]);
    }

    public function edit(CallUp $callUp): Response
    {
        return Inertia::render('Desportivo/CallUps/Edit', [
            'callUp' => $callUp,
            'athletes' => User::whereJsonContains('tipo_membro', 'atleta')
                ->where('estado', 'ativo')
                ->get(['id', 'nome_completo']),
        ]);
    }

    public function update(UpdateCallUpRequest $request, CallUp $callUp): RedirectResponse
    {
        $callUp->update($request->validated());

        return redirect()->route('call-ups.index')
            ->with('success', 'Convocatória atualizada com sucesso!');
    }

    public function destroy(CallUp $callUp): RedirectResponse
    {
        $callUp->delete();

        return redirect()->route('call-ups.index')
            ->with('success', 'Convocatória eliminada com sucesso!');
    }
}
