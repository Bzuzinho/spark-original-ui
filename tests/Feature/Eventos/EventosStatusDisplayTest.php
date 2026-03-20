<?php

namespace Tests\Feature\Eventos;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventosStatusDisplayTest extends TestCase
{
    use RefreshDatabase;

    public function test_eventos_index_displays_temporal_statuses_based_on_event_date(): void
    {
        $admin = User::factory()->create();

        $futureEvent = Event::create([
            'titulo' => 'Evento Futuro',
            'descricao' => 'Evento agendado para depois de hoje',
            'data_inicio' => now()->addDays(2)->toDateString(),
            'tipo' => 'prova',
            'estado' => 'agendado',
            'criado_por' => $admin->id,
        ]);

        $currentEvent = Event::create([
            'titulo' => 'Evento de Hoje',
            'descricao' => 'Evento em curso no dia atual',
            'data_inicio' => now()->toDateString(),
            'tipo' => 'prova',
            'estado' => 'agendado',
            'criado_por' => $admin->id,
        ]);

        $pastEvent = Event::create([
            'titulo' => 'Evento Passado',
            'descricao' => 'Evento já concluído',
            'data_inicio' => now()->subDays(2)->toDateString(),
            'tipo' => 'prova',
            'estado' => 'agendado',
            'criado_por' => $admin->id,
        ]);

        $inertiaVersion = app(HandleInertiaRequests::class)->version(request());

        $response = $this->actingAs($admin)->withHeaders([
            'X-Inertia' => 'true',
            'X-Requested-With' => 'XMLHttpRequest',
            'X-Inertia-Version' => (string) $inertiaVersion,
        ])->get(route('eventos.index'));

        $response->assertOk();
        $response->assertHeader('X-Inertia', 'true');
        $response->assertJsonPath('component', 'Eventos/Index');
        $response->assertJsonPath(
            'props.eventos.0.estado',
            'agendado'
        );
        $response->assertJsonPath(
            'props.eventos.1.estado',
            'em_curso'
        );
        $response->assertJsonPath(
            'props.eventos.2.estado',
            'concluido'
        );
        $response->assertJsonPath('props.eventos.0.id', $futureEvent->id);
        $response->assertJsonPath('props.eventos.1.id', $currentEvent->id);
        $response->assertJsonPath('props.eventos.2.id', $pastEvent->id);
        $response->assertJsonPath('props.stats.upcomingEvents', 1);
        $response->assertJsonPath('props.stats.completedEvents', 1);
    }
}