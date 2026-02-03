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

class ConvocatoriasController extends Controller
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
            'teams' => Team::where('active', true)->get(['id', 'name']),
            'events' => Event::where('start_date', '>=', now())
                ->orderBy('start_date')
                ->get(['id', 'title', 'start_date']),
            'athletes' => User::whereJsonContains('member_type', 'atleta')
                ->where('status', 'ativo')
                ->get(['id', 'full_name']),
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
            'athletes' => User::whereJsonContains('member_type', 'atleta')
                ->where('status', 'ativo')
                ->get(['id', 'full_name']),
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
