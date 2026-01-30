<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use App\Models\EventType;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class EventosController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Eventos/Index', [
            'eventos' => Event::with(['creator', 'eventType', 'convocations', 'attendances'])
                ->latest()
                ->paginate(15),
            'eventTypes' => EventType::where('active', true)->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Eventos/Create', [
            'eventTypes' => EventType::where('active', true)->get(),
            'users' => User::where('estado', 'ativo')->get(),
        ]);
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['criado_por'] = auth()->id();
        
        $event = Event::create($data);

        return redirect()->route('eventos.index')
            ->with('success', 'Evento criado com sucesso!');
    }

    public function show(Event $evento): Response
    {
        return Inertia::render('Eventos/Show', [
            'event' => $evento->load([
                'creator',
                'eventType',
                'convocations.user',
                'attendances.user',
                'results',
            ]),
        ]);
    }

    public function edit(Event $evento): Response
    {
        return Inertia::render('Eventos/Edit', [
            'event' => $evento->load(['eventType']),
            'eventTypes' => EventType::where('active', true)->get(),
            'users' => User::where('estado', 'ativo')->get(),
        ]);
    }

    public function update(UpdateEventRequest $request, Event $evento): RedirectResponse
    {
        $evento->update($request->validated());

        return redirect()->route('eventos.index')
            ->with('success', 'Evento atualizado com sucesso!');
    }

    public function destroy(Event $evento): RedirectResponse
    {
        $evento->delete();

        return redirect()->route('eventos.index')
            ->with('success', 'Evento eliminado com sucesso!');
    }
}
