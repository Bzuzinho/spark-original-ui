<?php

namespace Tests\Feature\Portal;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class PortalProfileFamilyAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guardian_can_view_and_edit_educando_profile_through_portal(): void
    {
        $guardian = User::factory()->create([
            'perfil' => 'encarregado',
            'tipo_membro' => ['encarregado_educacao'],
        ]);

        $educando = User::factory()->athlete()->create([
            'tipo_membro' => ['atleta'],
            'nome_completo' => 'Educando Portal',
        ]);

        $this->linkGuardianToEducandos($guardian, [$educando]);

        $showResponse = $this->inertiaGetAs($guardian, route('portal.profile', ['member' => $educando->id]));

        $showResponse->assertOk();
        $showResponse->assertJsonPath('component', 'Portal/Profile');
        $showResponse->assertJsonPath('props.profile.id', $educando->id);
        $showResponse->assertJsonPath('props.profile.can_edit', true);

        $updateResponse = $this->actingAs($guardian)->patch(route('portal.profile.update', ['member' => $educando->id]), [
            'nome_completo' => 'Educando Atualizado',
        ]);

        $updateResponse->assertRedirect(route('portal.profile', ['member' => $educando->id]));
        $this->assertDatabaseHas('users', [
            'id' => $educando->id,
            'nome_completo' => 'Educando Atualizado',
        ]);
    }

    public function test_user_cannot_view_or_edit_unrelated_profile_through_portal(): void
    {
        $user = User::factory()->create([
            'perfil' => 'user',
            'tipo_membro' => ['socio'],
        ]);

        $otherMember = User::factory()->create([
            'nome_completo' => 'Outro Membro',
        ]);

        $this->inertiaGetAs($user, route('portal.profile', ['member' => $otherMember->id]))->assertForbidden();

        $this->actingAs($user)
            ->patch(route('portal.profile.update', ['member' => $otherMember->id]), [
                'nome_completo' => 'Tentativa Inválida',
            ])
            ->assertForbidden();
    }

    public function test_guardian_portal_profile_still_works_when_family_tables_are_not_migrated(): void
    {
        $guardian = User::factory()->create([
            'perfil' => 'encarregado',
            'tipo_membro' => ['encarregado_educacao'],
        ]);

        $educando = User::factory()->athlete()->create([
            'tipo_membro' => ['atleta'],
            'nome_completo' => 'Educando Sem Familia Table',
        ]);

        $this->linkGuardianToEducandos($guardian, [$educando]);

        Schema::dropIfExists('familia_user');
        Schema::dropIfExists('familias');

        $response = $this->inertiaGetAs($guardian, route('portal.profile', ['member' => $educando->id]));

        $response->assertOk();
        $response->assertJsonPath('component', 'Portal/Profile');
        $response->assertJsonPath('props.profile.id', $educando->id);
        $response->assertJsonPath('props.profile.can_edit', true);
    }

    private function inertiaGetAs(User $user, string $uri)
    {
        $inertiaVersion = app(HandleInertiaRequests::class)->version(request());

        return $this->actingAs($user)->withHeaders([
            'X-Inertia' => 'true',
            'X-Requested-With' => 'XMLHttpRequest',
            'X-Inertia-Version' => (string) $inertiaVersion,
        ])->get($uri);
    }

    /**
     * @param  array<int, User>  $educandos
     */
    private function linkGuardianToEducandos(User $guardian, array $educandos): void
    {
        foreach ($educandos as $educando) {
            DB::table('user_guardian')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $educando->id,
                'guardian_id' => $guardian->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}