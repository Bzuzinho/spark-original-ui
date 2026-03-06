<?php

namespace Tests\Feature\Api;

use App\Models\ConvocationGroup;
use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ConvocatoriaKvDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_kv_sync_deletes_removed_convocation_group(): void
    {
        $user = User::factory()->create();

        $event = Event::create([
            'id' => (string) Str::uuid(),
            'titulo' => 'Evento Teste KV',
            'descricao' => 'Teste integração KV convocatória',
            'data_inicio' => now()->toDateString(),
            'data_fim' => now()->toDateString(),
            'tipo' => 'competicao',
            'visibilidade' => 'publico',
            'transporte_necessario' => false,
            'estado' => 'rascunho',
            'criado_por' => $user->id,
            'recorrente' => false,
        ]);

        $groupId = (string) Str::uuid();

        $createPayload = [
            'value' => [[
                'id' => $groupId,
                'evento_id' => $event->id,
                'data_criacao' => now()->toISOString(),
                'criado_por' => $user->id,
                'atletas_ids' => [],
                'tipo_custo' => 'por_salto',
            ]],
            'scope' => 'global',
        ];

        $this->actingAs($user)
            ->putJson('/api/kv/club-convocatorias-grupo', $createPayload)
            ->assertOk();

        $this->assertDatabaseHas('convocation_groups', [
            'id' => $groupId,
            'evento_id' => $event->id,
        ]);

        $deleteBySyncPayload = [
            'value' => [],
            'scope' => 'global',
        ];

        $this->actingAs($user)
            ->putJson('/api/kv/club-convocatorias-grupo', $deleteBySyncPayload)
            ->assertOk();

        $this->assertDatabaseMissing('convocation_groups', [
            'id' => $groupId,
        ]);
    }

    public function test_kv_sync_deletes_only_removed_group_when_multiple_exist(): void
    {
        $user = User::factory()->create();

        $event = Event::create([
            'id' => (string) Str::uuid(),
            'titulo' => 'Evento Teste KV 2',
            'descricao' => 'Teste integração KV convocatória múltipla',
            'data_inicio' => now()->toDateString(),
            'data_fim' => now()->toDateString(),
            'tipo' => 'competicao',
            'visibilidade' => 'publico',
            'transporte_necessario' => false,
            'estado' => 'rascunho',
            'criado_por' => $user->id,
            'recorrente' => false,
        ]);

        $keepId = (string) Str::uuid();
        $removeId = (string) Str::uuid();

        $initialPayload = [
            'value' => [
                [
                    'id' => $keepId,
                    'evento_id' => $event->id,
                    'data_criacao' => now()->toISOString(),
                    'criado_por' => $user->id,
                    'atletas_ids' => [],
                    'tipo_custo' => 'por_salto',
                ],
                [
                    'id' => $removeId,
                    'evento_id' => $event->id,
                    'data_criacao' => now()->toISOString(),
                    'criado_por' => $user->id,
                    'atletas_ids' => [],
                    'tipo_custo' => 'por_salto',
                ],
            ],
            'scope' => 'global',
        ];

        $this->actingAs($user)
            ->putJson('/api/kv/club-convocatorias-grupo', $initialPayload)
            ->assertOk();

        $filteredPayload = [
            'value' => [[
                'id' => $keepId,
                'evento_id' => $event->id,
                'data_criacao' => now()->toISOString(),
                'criado_por' => $user->id,
                'atletas_ids' => [],
                'tipo_custo' => 'por_salto',
            ]],
            'scope' => 'global',
        ];

        $this->actingAs($user)
            ->putJson('/api/kv/club-convocatorias-grupo', $filteredPayload)
            ->assertOk();

        $this->assertDatabaseHas('convocation_groups', [
            'id' => $keepId,
        ]);

        $this->assertDatabaseMissing('convocation_groups', [
            'id' => $removeId,
        ]);
    }
}
