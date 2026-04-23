<?php

namespace Tests\Feature\Configuracoes;

use App\Models\CostCenter;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CostCenterCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_cost_center_create_requires_name_only_and_generates_code(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->from(route('configuracoes'))
            ->post(route('configuracoes.centros-custo.store'), [
                'tipo' => 'departamento',
                'descricao' => 'Centro de custo de teste',
                'ativo' => true,
            ])
            ->assertSessionHasErrors(['nome']);

        $this->actingAs($user)
            ->post(route('configuracoes.centros-custo.store'), [
                'nome' => 'Centro Financeiro Teste',
                'tipo' => 'departamento',
                'ativo' => true,
            ])
            ->assertRedirect(route('configuracoes'));

        $this->assertDatabaseHas('cost_centers', [
            'nome' => 'Centro Financeiro Teste',
            'tipo' => 'departamento',
            'ativo' => true,
        ]);

        $this->assertNotNull(CostCenter::where('nome', 'Centro Financeiro Teste')->value('codigo'));
    }

    public function test_cost_center_update_keeps_existing_code_when_field_is_blank(): void
    {
        $user = User::factory()->create();
        $costCenter = CostCenter::create([
            'codigo' => 'CC-OLD-01',
            'nome' => 'Centro Antigo',
            'tipo' => 'departamento',
            'ativo' => true,
        ]);

        $this->actingAs($user)
            ->put(route('configuracoes.centros-custo.update', $costCenter), [
                'codigo' => '',
                'nome' => 'Centro Atualizado',
                'tipo' => 'projeto',
                'descricao' => 'Atualizado sem reenviar codigo',
                'ativo' => true,
            ])
            ->assertRedirect(route('configuracoes'));

        $costCenter->refresh();

        $this->assertSame('CC-OLD-01', $costCenter->codigo);
        $this->assertSame('Centro Atualizado', $costCenter->nome);
        $this->assertSame('projeto', $costCenter->tipo);
    }
}