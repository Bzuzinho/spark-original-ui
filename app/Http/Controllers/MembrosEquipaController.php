<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTeamMemberRequest;
use App\Http\Requests\UpdateTeamMemberRequest;
use App\Models\TeamMember;
use App\Models\Team;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MembrosEquipaController extends Controller
{
    public function index(Team $team): Response
    {
        return Inertia::render('Desportivo/TeamMembers/Index', [
            'team' => $team->load('members.user'),
            'availableAthletes' => User::whereJsonContains('member_type', 'atleta')
                ->where('status', 'ativo')
                ->whereNotIn('id', $team->members()->pluck('user_id'))
                ->get(['id', 'full_name']),
        ]);
    }

    public function store(StoreTeamMemberRequest $request): RedirectResponse
    {
        TeamMember::create($request->validated());

        return back()->with('success', 'Atleta adicionado à equipa com sucesso!');
    }

    public function update(UpdateTeamMemberRequest $request, TeamMember $teamMember): RedirectResponse
    {
        $teamMember->update($request->validated());

        return back()->with('success', 'Dados do atleta atualizados com sucesso!');
    }

    public function destroy(TeamMember $teamMember): RedirectResponse
    {
        $teamMember->delete();

        return back()->with('success', 'Atleta removido da equipa com sucesso!');
    }
}
