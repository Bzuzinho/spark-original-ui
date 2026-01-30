<?php

namespace App\Http\Controllers;

use App\Models\Communication;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ComunicacaoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Comunicacao/Index', [
            'communications' => Communication::with(['sender'])
                ->latest()
                ->paginate(15),
            'stats' => [
                'totalCommunications' => Communication::count(),
                'sentToday' => Communication::whereDate('data_envio', today())->count(),
                'pendingCommunications' => Communication::where('estado', 'pendente')->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Comunicacao/Create', [
            'users' => User::where('estado', 'ativo')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'titulo' => 'required|string|max:255',
            'mensagem' => 'required|string',
            'tipo_comunicacao' => 'required|in:email,sms,notificacao',
            'destinatarios' => 'required|array',
            'data_envio' => 'nullable|date',
        ]);

        $data['enviado_por'] = auth()->id();
        $data['estado'] = 'pendente';

        Communication::create($data);

        return redirect()->route('comunicacao.index')
            ->with('success', 'Comunicação criada com sucesso!');
    }

    public function show(Communication $comunicacao): Response
    {
        return Inertia::render('Comunicacao/Show', [
            'communication' => $comunicacao->load(['sender']),
        ]);
    }

    public function edit(Communication $comunicacao): Response
    {
        return Inertia::render('Comunicacao/Edit', [
            'communication' => $comunicacao,
            'users' => User::where('estado', 'ativo')->get(),
        ]);
    }

    public function update(Request $request, Communication $comunicacao): RedirectResponse
    {
        $data = $request->validate([
            'titulo' => 'required|string|max:255',
            'mensagem' => 'required|string',
            'tipo_comunicacao' => 'required|in:email,sms,notificacao',
            'destinatarios' => 'required|array',
            'data_envio' => 'nullable|date',
        ]);

        $comunicacao->update($data);

        return redirect()->route('comunicacao.index')
            ->with('success', 'Comunicação atualizada com sucesso!');
    }

    public function destroy(Communication $comunicacao): RedirectResponse
    {
        $comunicacao->delete();

        return redirect()->route('comunicacao.index')
            ->with('success', 'Comunicação eliminada com sucesso!');
    }
}
