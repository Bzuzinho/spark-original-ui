<?php

namespace App\Http\Controllers;

use App\Models\UserType;
use App\Models\AgeGroup;
use App\Models\EventType;
use App\Models\ClubSetting;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ConfiguracoesController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Configuracoes/Index', [
            'userTypes' => UserType::all(),
            'ageGroups' => AgeGroup::all(),
            'eventTypes' => EventType::all(),
            'clubSettings' => ClubSetting::first(),
        ]);
    }

    public function storeUserType(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        UserType::create($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Tipo de utilizador criado com sucesso!');
    }

    public function updateUserType(Request $request, UserType $userType): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        $userType->update($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Tipo de utilizador atualizado com sucesso!');
    }

    public function destroyUserType(UserType $userType): RedirectResponse
    {
        $userType->delete();

        return redirect()->route('configuracoes')
            ->with('success', 'Tipo de utilizador eliminado com sucesso!');
    }

    public function storeAgeGroup(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'idade_minima' => 'required|integer|min:0',
            'idade_maxima' => 'required|integer|min:0',
            'descricao' => 'nullable|string',
        ]);

        AgeGroup::create($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Escalão etário criado com sucesso!');
    }

    public function updateAgeGroup(Request $request, AgeGroup $ageGroup): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'idade_minima' => 'required|integer|min:0',
            'idade_maxima' => 'required|integer|min:0',
            'descricao' => 'nullable|string',
        ]);

        $ageGroup->update($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Escalão etário atualizado com sucesso!');
    }

    public function destroyAgeGroup(AgeGroup $ageGroup): RedirectResponse
    {
        $ageGroup->delete();

        return redirect()->route('configuracoes')
            ->with('success', 'Escalão etário eliminado com sucesso!');
    }

    public function storeEventType(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'categoria' => 'nullable|string',
            'cor' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        EventType::create($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Tipo de evento criado com sucesso!');
    }

    public function updateEventType(Request $request, EventType $eventType): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'categoria' => 'nullable|string',
            'cor' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        $eventType->update($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Tipo de evento atualizado com sucesso!');
    }

    public function destroyEventType(EventType $eventType): RedirectResponse
    {
        $eventType->delete();

        return redirect()->route('configuracoes')
            ->with('success', 'Tipo de evento eliminado com sucesso!');
    }

    public function updateClubSettings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nome_clube' => 'required|string|max:255',
            'sigla' => 'nullable|string|max:10',
            'morada' => 'nullable|string',
            'codigo_postal' => 'nullable|string|max:20',
            'localidade' => 'nullable|string|max:100',
            'telefone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'nif' => 'nullable|string|max:20',
            'iban' => 'nullable|string|max:34',
        ]);

        $clubSettings = ClubSetting::first();
        
        if ($clubSettings) {
            $clubSettings->update($data);
        } else {
            ClubSetting::create($data);
        }

        return redirect()->route('configuracoes')
            ->with('success', 'Configurações do clube atualizadas com sucesso!');
    }
}
