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

class MembersController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Members/Index', [
            'members' => User::with(['userTypes', 'ageGroup', 'encarregados', 'educandos'])
                ->latest()
                ->get(),
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Members/Create', [
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
            'guardians' => User::whereJsonContains('member_type', 'encarregado_educacao')->get(),
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

        return redirect()->route('members.index')
            ->with('success', 'Membro criado com sucesso!');
    }

    public function show(User $member): Response
    {
        return Inertia::render('Members/Show', [
            'member' => $member->load([
                'userTypes',
                'ageGroup',
                'encarregados',
                'educandos',
                'eventsCreated',
                'eventAttendances',
                'documents',
                'relationships.relatedUser',
            ]),
            'allUsers' => User::select('id', 'full_name', 'member_number', 'member_type')->get(),
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
        ]);
    }

    public function edit(User $member): Response
    {
        return Inertia::render('Members/Edit', [
            'member' => $member->load(['userTypes', 'ageGroup', 'encarregados', 'educandos']),
            'userTypes' => UserType::where('active', true)->get(),
            'ageGroups' => AgeGroup::all(),
            'guardians' => User::whereJsonContains('member_type', 'encarregado_educacao')
                ->where('id', '!=', $member->id)
                ->get(),
        ]);
    }

    public function update(UpdateMemberRequest $request, User $member): RedirectResponse
    {
        $data = $request->validated();
        
        if (isset($data['password']) && $data['password']) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        
        $member->update($data);
        
        // Sync relationships
        if (isset($data['user_types'])) {
            $member->userTypes()->sync($data['user_types']);
        }
        
        if (isset($data['encarregados'])) {
            $member->encarregados()->sync($data['encarregados']);
        }

        return redirect()->route('members.index')
            ->with('success', 'Membro atualizado com sucesso!');
    }

    public function destroy(User $member): RedirectResponse
    {
        $member->delete();

        return redirect()->route('members.index')
            ->with('success', 'Membro eliminado com sucesso!');
    }
}
