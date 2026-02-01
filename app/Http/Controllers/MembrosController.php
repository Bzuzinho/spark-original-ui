<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateMemberRequest;
use App\Models\User;
use App\Models\UserType;
use App\Models\AgeGroup;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;

class MembrosController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Membros/Index', [
            'members' => User::with(['userTypes', 'ageGroup', 'encarregados', 'educandos'])
                ->latest()
                ->get(),
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Membros/Create', [
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
            'guardians' => User::whereJsonContains('tipo_membro', 'encarregado_educacao')->get(),
        ]);
    }

    public function store(StoreMemberRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password'] ?? 'password123');
        
        $member = User::create($data);
        
        // Sync relationships
        if (isset($data['user_types'])) {
            $member->userTypes()->sync($data['user_types']);
        }
        
        if (isset($data['encarregados'])) {
            $member->encarregados()->sync($data['encarregados']);
        }

        return redirect()->route('membros.index')
            ->with('success', 'Membro criado com sucesso!');
    }

    public function show(User $membro): Response
    {
        return Inertia::render('Membros/Show', [
            'member' => $membro->load([
                'userTypes',
                'ageGroup',
                'encarregados',
                'educandos',
                'eventsCreated',
                'eventAttendances',
                'documents',
                'relationships.relatedUser',
            ]),
            'allUsers' => User::select('id', 'nome_completo', 'numero_socio', 'tipo_membro')->get(),
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
        ]);
    }

    public function edit(User $membro): Response
    {
        return Inertia::render('Membros/Edit', [
            'member' => $membro->load(['userTypes', 'ageGroup', 'encarregados', 'educandos']),
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
            'guardians' => User::whereJsonContains('tipo_membro', 'encarregado_educacao')
                ->where('id', '!=', $membro->id)
                ->get(),
        ]);
    }

    public function update(UpdateMemberRequest $request, User $membro): RedirectResponse
    {
        $data = $request->validated();
        
        if (isset($data['password']) && $data['password']) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        
        $membro->update($data);
        
        // Sync relationships
        if (isset($data['user_types'])) {
            $membro->userTypes()->sync($data['user_types']);
        }
        
        if (isset($data['encarregados'])) {
            $membro->encarregados()->sync($data['encarregados']);
        }

        return redirect()->route('membros.index')
            ->with('success', 'Membro atualizado com sucesso!');
    }

    public function destroy(User $membro): RedirectResponse
    {
        $membro->delete();

        return redirect()->route('membros.index')
            ->with('success', 'Membro eliminado com sucesso!');
    }
}
