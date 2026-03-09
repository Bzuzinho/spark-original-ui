<?php

namespace Tests\Feature\Desportivo;

use App\Models\Event;
use App\Models\Presence;
use App\Models\Training;
use App\Models\TrainingAthlete;
use App\Models\User;
use App\Services\Desportivo\MigrateLegacyPresencesAction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MigrateLegacyPresencesActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_execute_returns_complete_report_when_no_legacy_presences_exist(): void
    {
        $report = app(MigrateLegacyPresencesAction::class)->execute(true);

        $this->assertArrayHasKey('duration_seconds', $report);
        $this->assertSame(0, $report['total_presences']);
        $this->assertSame(0, $report['migrated']);
        $this->assertSame(0, $report['errors']);
    }

    public function test_execute_migrates_legacy_presence_to_training_athlete(): void
    {
        $admin = User::factory()->create();
        $athlete = User::factory()->create();

        $event = Event::create([
            'titulo' => 'Treino migração',
            'descricao' => 'Evento treino',
            'data_inicio' => now()->toDateString(),
            'tipo' => 'treino',
            'criado_por' => $admin->id,
        ]);

        $training = Training::create([
            'data' => now()->toDateString(),
            'tipo_treino' => 'tecnico',
            'evento_id' => $event->id,
            'criado_por' => $admin->id,
        ]);

        $presence = Presence::create([
            'user_id' => $athlete->id,
            'data' => now()->toDateString(),
            'treino_id' => $training->id,
            'tipo' => 'treino',
            'presente' => false,
            'status' => 'justificado',
            'is_legacy' => true,
        ]);

        $report = app(MigrateLegacyPresencesAction::class)->execute(false);

        $this->assertSame(1, $report['total_presences']);
        $this->assertSame(1, $report['migrated']);
        $this->assertSame(0, $report['errors']);

        $this->assertDatabaseHas('training_athletes', [
            'treino_id' => $training->id,
            'user_id' => $athlete->id,
            'estado' => 'justificado',
            'presente' => false,
        ]);

        $presence->refresh();
        $this->assertNotNull($presence->migrated_to_training_athlete_id);

        $this->assertTrue(
            TrainingAthlete::where('id', $presence->migrated_to_training_athlete_id)->exists()
        );
    }
}
