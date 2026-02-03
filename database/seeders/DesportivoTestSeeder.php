<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\TrainingSession;
use App\Models\Event;
use App\Models\CallUp;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DesportivoTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test users (athletes and coaches)
        $coach = User::create([
            'name' => 'João Silva',
            'email' => 'joao.silva@test.com',
            'password' => bcrypt('password'),
            'full_name' => 'João Silva',
            'member_type' => json_encode(['treinador']),
            'status' => 'active',
        ]);

        $athletes = [];
        for ($i = 1; $i <= 10; $i++) {
            $athletes[] = User::create([
                'name' => "Atleta $i",
                'email' => "atleta$i@test.com",
                'password' => bcrypt('password'),
                'full_name' => "Atleta Teste $i",
                'member_type' => json_encode(['atleta']),
                'status' => 'active',
            ]);
        }

        // Create teams
        $teamA = Team::create([
            'nome' => 'Equipa A - Seniores',
            'escalao' => 'Seniores',
            'treinador_id' => $coach->id,
            'ano_fundacao' => 2020,
            'ativa' => true,
        ]);

        $teamB = Team::create([
            'nome' => 'Equipa B - Juniores',
            'escalao' => 'Juniores',
            'treinador_id' => $coach->id,
            'ano_fundacao' => 2022,
            'ativa' => true,
        ]);

        // Add athletes to teams
        foreach (array_slice($athletes, 0, 6) as $index => $athlete) {
            TeamMember::create([
                'team_id' => $teamA->id,
                'user_id' => $athlete->id,
                'posicao' => ['Nadador', 'Velocista', 'Meio-fundo'][$index % 3],
                'numero_camisola' => $index + 1,
                'data_entrada' => Carbon::now()->subMonths(rand(1, 12)),
            ]);
        }

        foreach (array_slice($athletes, 6, 4) as $index => $athlete) {
            TeamMember::create([
                'team_id' => $teamB->id,
                'user_id' => $athlete->id,
                'posicao' => ['Nadador', 'Velocista'][$index % 2],
                'numero_camisola' => $index + 1,
                'data_entrada' => Carbon::now()->subMonths(rand(1, 6)),
            ]);
        }

        // Create training sessions
        for ($i = 0; $i < 15; $i++) {
            TrainingSession::create([
                'team_id' => $i % 2 == 0 ? $teamA->id : $teamB->id,
                'data_hora' => Carbon::now()->subDays(rand(0, 30))->setHour(rand(17, 20))->setMinute(0),
                'duracao_minutos' => [60, 90, 120][rand(0, 2)],
                'local' => ['Piscina Municipal', 'Piscina Clube', 'Centro Desportivo'][rand(0, 2)],
                'objetivos' => 'Treino técnico e resistência',
                'status' => $i < 5 ? 'agendado' : (rand(0, 1) ? 'realizado' : 'cancelado'),
            ]);
        }

        // Create events
        $event1 = Event::create([
            'titulo' => 'Campeonato Regional',
            'descricao' => 'Competição regional de natação',
            'data_inicio' => Carbon::now()->addDays(15),
            'data_fim' => Carbon::now()->addDays(15),
            'local' => 'Piscina Olímpica',
            'tipo' => 'prova',
            'criado_por' => $coach->id,
        ]);

        $event2 = Event::create([
            'titulo' => 'Torneio Nacional',
            'descricao' => 'Torneio nacional de natação',
            'data_inicio' => Carbon::now()->addDays(30),
            'data_fim' => Carbon::now()->addDays(32),
            'local' => 'Centro Nacional',
            'tipo' => 'prova',
            'criado_por' => $coach->id,
        ]);

        // Create call-ups
        CallUp::create([
            'event_id' => $event1->id,
            'team_id' => $teamA->id,
            'atletas_convocados' => array_map(fn($a) => $a->id, array_slice($athletes, 0, 4)),
            'presencas' => [],
            'observacoes' => 'Convocatória para Campeonato Regional',
        ]);

        CallUp::create([
            'event_id' => $event2->id,
            'team_id' => $teamB->id,
            'atletas_convocados' => array_map(fn($a) => $a->id, array_slice($athletes, 6, 3)),
            'presencas' => [],
            'observacoes' => 'Convocatória para Torneio Nacional',
        ]);
    }
}
