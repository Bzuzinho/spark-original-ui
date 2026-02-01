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

class SettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Settings/Index', [
            'userTypes' => UserType::all(),
            'ageGroups' => AgeGroup::all(),
            'eventTypes' => EventType::all(),
            'clubSettings' => ClubSetting::first(),
        ]);
    }

    public function storeUserType(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'active' => 'boolean',
        ]);

        UserType::create($data);

        return redirect()->route('settings')
            ->with('success', 'Tipo de utilizador criado com sucesso!');
    }

    public function updateUserType(Request $request, UserType $userType): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $userType->update($data);

        return redirect()->route('settings')
            ->with('success', 'Tipo de utilizador atualizado com sucesso!');
    }

    public function destroyUserType(UserType $userType): RedirectResponse
    {
        $userType->delete();

        return redirect()->route('settings')
            ->with('success', 'Tipo de utilizador eliminado com sucesso!');
    }

    public function storeAgeGroup(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'min_age' => 'required|integer|min:0',
            'max_age' => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        AgeGroup::create($data);

        return redirect()->route('settings')
            ->with('success', 'Escalão etário criado com sucesso!');
    }

    public function updateAgeGroup(Request $request, AgeGroup $ageGroup): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'min_age' => 'required|integer|min:0',
            'max_age' => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $ageGroup->update($data);

        return redirect()->route('settings')
            ->with('success', 'Escalão etário atualizado com sucesso!');
    }

    public function destroyAgeGroup(AgeGroup $ageGroup): RedirectResponse
    {
        $ageGroup->delete();

        return redirect()->route('settings')
            ->with('success', 'Escalão etário eliminado com sucesso!');
    }

    public function storeEventType(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'color' => 'nullable|string',
            'active' => 'boolean',
        ]);

        EventType::create($data);

        return redirect()->route('settings')
            ->with('success', 'Tipo de evento criado com sucesso!');
    }

    public function updateEventType(Request $request, EventType $eventType): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'color' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $eventType->update($data);

        return redirect()->route('settings')
            ->with('success', 'Tipo de evento atualizado com sucesso!');
    }

    public function destroyEventType(EventType $eventType): RedirectResponse
    {
        $eventType->delete();

        return redirect()->route('settings')
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

        return redirect()->route('settings')
            ->with('success', 'Configurações do clube atualizadas com sucesso!');
    }
}
