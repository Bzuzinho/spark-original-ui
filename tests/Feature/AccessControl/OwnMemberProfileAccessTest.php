<?php

namespace Tests\Feature\AccessControl;

use App\Models\User;
use App\Models\UserType;
use App\Services\AccessControl\UserTypeAccessControlService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Tests\TestCase;

class OwnMemberProfileAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_athlete_can_bypass_member_module_guard_for_own_profile_view(): void
    {
        $athlete = User::factory()->create([
            'perfil' => 'atleta',
        ]);

        $userType = UserType::query()->create([
            'codigo' => 'atleta',
            'nome' => 'Atleta',
            'ativo' => true,
            'menu_visibility_configured' => true,
        ]);

        $athlete->userTypes()->attach($userType);

        $request = $this->makeMemberShowRequest($athlete->id);
        $service = app(UserTypeAccessControlService::class);

        $this->assertTrue($service->canBypassOwnMemberProfileView($athlete, $request, 'membros'));
        $this->assertTrue($service->canBypassOwnMemberProfileView($athlete, $request, null, 'membros.ficha', 'view'));
    }

    public function test_athlete_cannot_bypass_member_profile_view_for_another_member(): void
    {
        $athlete = User::factory()->create([
            'perfil' => 'atleta',
        ]);

        $otherMember = User::factory()->create();

        $userType = UserType::query()->create([
            'codigo' => 'atleta',
            'nome' => 'Atleta',
            'ativo' => true,
            'menu_visibility_configured' => true,
        ]);

        $athlete->userTypes()->attach($userType);

        $request = $this->makeMemberShowRequest($otherMember->id);
        $service = app(UserTypeAccessControlService::class);

        $this->assertFalse($service->canBypassOwnMemberProfileView($athlete, $request, 'membros'));
        $this->assertFalse($service->canBypassOwnMemberProfileView($athlete, $request, null, 'membros.ficha', 'view'));
    }

    private function makeMemberShowRequest(string $memberId): Request
    {
        $request = Request::create('/membros/' . $memberId, 'GET');
        $route = new Route('GET', '/membros/{member}', []);
        $route->name('membros.show');
        $route->bind($request);
        $route->setParameter('member', $memberId);
        $request->setRouteResolver(static fn () => $route);

        return $request;
    }
}