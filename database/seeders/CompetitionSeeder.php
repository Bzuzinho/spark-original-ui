<?php

namespace Database\Seeders;

use App\Models\Competition;
use Illuminate\Database\Seeder;

class CompetitionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $competitions = [
            [
                'nome' => 'Natação - Provas Individuais',
                'local' => 'Piscina Municipal',
                'data_inicio' => now()->addMonth()->toDateString(),
                'data_fim' => null,
                'tipo' => 'natacao',
                'evento_id' => null,
            ],
            [
                'nome' => 'Natação - Provas de Estafeta',
                'local' => 'Piscina Municipal',
                'data_inicio' => now()->addMonth()->toDateString(),
                'data_fim' => null,
                'tipo' => 'natacao_estafeta',
                'evento_id' => null,
            ],
        ];

        foreach ($competitions as $competition) {
            Competition::updateOrCreate(
                ['nome' => $competition['nome']],
                $competition
            );
        }
    }
}
