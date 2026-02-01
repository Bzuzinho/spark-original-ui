<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommunicationRequest;
use App\Http\Requests\UpdateCommunicationRequest;
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
        $communications = Communication::query()
            ->latest()
            ->paginate(15);

        $totalCommunications = Communication::count();
        $scheduledCount = Communication::scheduled()->count();
        $sentToday = Communication::sent()
            ->whereDate('enviado_em', today())
            ->count();
        $totalSent = Communication::sent()->count();
        $successRate = $totalSent > 0 
            ? round((Communication::sent()->sum('total_enviados') / 
                     (Communication::sent()->sum('total_enviados') + Communication::sent()->sum('total_falhados'))) * 100, 1)
            : 0;

        return Inertia::render('Comunicacao/Index', [
            'communications' => $communications,
            'stats' => [
                'totalCommunications' => $totalCommunications,
                'scheduledCount' => $scheduledCount,
                'sentToday' => $sentToday,
                'totalSent' => $totalSent,
                'successRate' => $successRate,
            ],
        ]);
    }

    public function create(): Response
    {
        $users = User::where('estado', 'ativo')
            ->select('id', 'name', 'email')
            ->get();

        return Inertia::render('Comunicacao/Create', [
            'users' => $users,
        ]);
    }

    public function store(StoreCommunicationRequest $request): RedirectResponse
    {
        $data = $request->validated();
        
        // Set default estado if not provided
        if (!isset($data['estado'])) {
            $data['estado'] = isset($data['agendado_para']) ? 'agendada' : 'rascunho';
        }

        Communication::create($data);

        return redirect()->route('comunicacao.index')
            ->with('success', 'Comunicação criada com sucesso!');
    }

    public function show(Communication $comunicacao): Response
    {
        return Inertia::render('Comunicacao/Show', [
            'communication' => $comunicacao,
        ]);
    }

    public function edit(Communication $comunicacao): Response
    {
        $users = User::where('estado', 'ativo')
            ->select('id', 'name', 'email')
            ->get();

        return Inertia::render('Comunicacao/Edit', [
            'communication' => $comunicacao,
            'users' => $users,
        ]);
    }

    public function update(UpdateCommunicationRequest $request, Communication $comunicacao): RedirectResponse
    {
        $data = $request->validated();

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

    /**
     * Send a communication immediately or schedule it
     */
    public function send(Request $request, Communication $comunicacao): RedirectResponse
    {
        // Validate the communication is in a sendable state
        if (!in_array($comunicacao->estado, ['rascunho', 'agendada'])) {
            return back()->with('error', 'Esta comunicação já foi enviada ou falhou.');
        }

        $sendNow = $request->boolean('send_now', true);

        if ($sendNow) {
            // In a real implementation, this would dispatch a job to send emails
            // For now, we'll just mark it as sent (mock implementation)
            $comunicacao->update([
                'estado' => 'enviada',
                'enviado_em' => now(),
                'total_enviados' => count($comunicacao->destinatarios),
                'total_falhados' => 0,
            ]);

            // TODO: Dispatch SendCommunicationJob::dispatch($comunicacao);

            return redirect()->route('comunicacao.index')
                ->with('success', 'Comunicação enviada com sucesso!');
        } else {
            // Schedule for later
            $comunicacao->update([
                'estado' => 'agendada',
            ]);

            return redirect()->route('comunicacao.index')
                ->with('success', 'Comunicação agendada com sucesso!');
        }
    }
}

