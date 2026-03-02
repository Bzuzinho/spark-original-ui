<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AgeGroup;

class AgeGroupSeeder extends Seeder
{
    /**
     * Seed the age groups table com os escalões do clube.
     */
    public function run(): void
    {
        $ageGroups = [
            [
                'nome' => 'Cadetes',
                'idade_minima' => 6,
                'idade_maxima' => 11,
                'ativo' => true,
            ],
            [
                'nome' => 'Junior A',
                'idade_minima' => 12,
                'idade_maxima' => 13,
                'ativo' => true,
            ],
            [
                'nome' => 'Junior B',
                'idade_minima' => 14,
                'idade_maxima' => 15,
                'ativo' => true,
            ],
            [
                'nome' => 'Junior C',
                'idade_minima' => 16,
                'idade_maxima' => 17,
                'ativo' => true,
            ],
            [
                'nome' => 'Senior',
                'idade_minima' => 18,
                'idade_maxima' => 24,
                'ativo' => true,
            ],
            [
                'nome' => 'Master',
                'idade_minima' => 25,
                'idade_maxima' => 99,
                'ativo' => true,
            ],
        ];

        foreach ($ageGroups as $ageGroup) {
            AgeGroup::updateOrCreate(
                ['nome' => $ageGroup['nome']],
                $ageGroup
            );
        }

        $this->command->info('✓ Age groups seeded with ' . count($ageGroups) . ' escalões');
    }
}
