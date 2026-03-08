<?php

namespace Database\Seeders;

use App\Models\Season;
use App\Models\Macrocycle;
use App\Models\Training;
use App\Models\AgeGroup;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DesportivoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create age groups
        $infantis = AgeGroup::firstOrCreate(['nome' => 'Infantis']);
        $juvenis = AgeGroup::firstOrCreate(['nome' => 'Juvenis']);
        $masters = AgeGroup::firstOrCreate(['nome' => 'Masters']);

        // Create a current season
        $season = Season::create([
            'nome' => 'Época 2025/2026',
            'ano_temporada' => '2025/2026',
            'data_inicio' => Carbon::now()->startOfYear(),
            'data_fim' => Carbon::now()->endOfYear(),
            'tipo' => 'Principal',
            'estado' => 'Em curso',
            'piscina_principal' => 'Piscina 25m',
            'escaloes_abrangidos' => [$infantis->id, $juvenis->id, $masters->id],
            'descricao' => 'Época competitiva principal com foco em técnica e resistência',
            'volume_total_previsto' => 500,
            'volume_medio_semanal' => 25,
            'num_semanas_previsto' => 20,
            'num_competicoes_previstas' => 5,
            'objetivos_performance' => 'Melhoria de 3-5% nos tempos',
            'objetivos_tecnicos' => 'Aperfeiçoamento de viragens e saídas',
        ]);

        // Create macrocycles
        Macrocycle::create([
            'epoca_id' => $season->id,
            'nome' => 'Preparação Geral',
            'tipo' => 'Preparação geral',
            'data_inicio' => Carbon::now()->startOfYear(),
            'data_fim' => Carbon::now()->startOfYear()->addDays(28),
            'escalao' => 'Geral',
        ]);

        Macrocycle::create([
            'epoca_id' => $season->id,
            'nome' => 'Preparação Específica',
            'tipo' => 'Preparação específica',
            'data_inicio' => Carbon::now()->startOfYear()->addDays(29),
            'data_fim' => Carbon::now()->startOfYear()->addDays(84),
            'escalao' => 'Geral',
        ]);

        // Create sample trainings
        $trainingData = [
            [
                'numero_treino' => 'T001',
                'data' => Carbon::now(),
                'hora_inicio' => '09:00',
                'hora_fim' => '10:00',
                'local' => 'Piscina 25m',
                'tipo_treino' => 'Resistência',
                'volume_planeado_m' => 2000,
                'descricao_treino' => '4x500m @ 80% esforço com 30s repouso',
                'escaloes' => [$infantis->id],
                'notas_gerais' => 'Focar em técnica de respiração',
            ],
            [
                'numero_treino' => 'T002',
                'data' => Carbon::now()->addDay(),
                'hora_inicio' => '10:00',
                'hora_fim' => '11:00',
                'local' => 'Piscina 25m',
                'tipo_treino' => 'Técnica',
                'volume_planeado_m' => 1500,
                'descricao_treino' => 'Trabalho de viragens e toque',
                'escaloes' => [$juvenis->id],
                'notas_gerais' => 'Sessão técnica sem cronômetro',
            ],
            [
                'numero_treino' => 'T003',
                'data' => Carbon::now()->addDays(2),
                'hora_inicio' => '14:00',
                'hora_fim' => '15:30',
                'local' => 'Piscina 25m',
                'tipo_treino' => 'Competição',
                'volume_planeado_m' => 3000,
                'descricao_treino' => '10x200m @ 95% com 20s repouso',
                'escaloes' => [$masters->id],
                'notas_gerais' => 'Sessão de preparação para prova',
            ],
        ];

        foreach ($trainingData as $data) {
            Training::create(array_merge($data, [
                'epoca_id' => $season->id,
                'criado_por' => auth()->id() ?? '1',
                'escaloes' => json_encode($data['escaloes'] ?? []),
            ]));
        }

        echo "✅ Desportivo Seeder executado com sucesso!\n";
        echo "   - 1 Época criada (Época 2025/2026)\n";
        echo "   - 2 Macrociclos criados\n";
        echo "   - 3 Treinos de exemplo criados\n";
    }
}
