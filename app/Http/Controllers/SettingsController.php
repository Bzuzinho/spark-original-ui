<?php

namespace App\Http\Controllers;

use App\Models\UserType;
use App\Models\AgeGroup;
use App\Models\EventType;
use App\Models\ProductCategory;
use App\Models\SponsorCategory;
use App\Models\NewsCategory;
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
            'productCategories' => ProductCategory::all(),
            'sponsorCategories' => SponsorCategory::all(),
            'newsCategories' => NewsCategory::all(),
        ]);
    }

    public function storeUserType(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'active' => 'boolean',
        ]);

        UserType::create($data);

        return redirect()->route('settings')
            ->with('success', 'Tipo de utilizador criado com sucesso!');
    }

    public function updateUserType(Request $request, UserType $userType): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
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
            'nome' => 'required|string|max:255',
            'idade_minima' => 'required|integer|min:0',
            'idade_maxima' => 'required|integer|min:0',
            'descricao' => 'nullable|string',
        ]);

        AgeGroup::create($data);

        return redirect()->route('settings')
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
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'active' => 'boolean',
        ]);

        EventType::create($data);

        return redirect()->route('settings')
            ->with('success', 'Tipo de evento criado com sucesso!');
    }

    public function updateEventType(Request $request, EventType $eventType): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
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
}
