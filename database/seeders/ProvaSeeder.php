<?php

namespace Database\Seeders;

use App\Models\Prova;
use Illuminate\Database\Seeder;

class ProvaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Provas Individuais - create for both M and F
        $provasIndividuaisData = [
            ['estilo' => '50 Livres', 'distancia_m' => 50],
            ['estilo' => '100 Livres', 'distancia_m' => 100],
            ['estilo' => '200 Livres', 'distancia_m' => 200],
            ['estilo' => '400 Livres', 'distancia_m' => 400],
            ['estilo' => '800 Livres', 'distancia_m' => 800],
            ['estilo' => '1500 Livres', 'distancia_m' => 1500],
            ['estilo' => '50 Costas', 'distancia_m' => 50],
            ['estilo' => '100 Costas', 'distancia_m' => 100],
            ['estilo' => '200 Costas', 'distancia_m' => 200],
            ['estilo' => '50 Bruços', 'distancia_m' => 50],
            ['estilo' => '100 Bruços', 'distancia_m' => 100],
            ['estilo' => '200 Bruços', 'distancia_m' => 200],
            ['estilo' => '50 Mariposa', 'distancia_m' => 50],
            ['estilo' => '100 Mariposa', 'distancia_m' => 100],
            ['estilo' => '200 Mariposa', 'distancia_m' => 200],
            ['estilo' => '100 Estilos', 'distancia_m' => 100],
            ['estilo' => '200 Estilos', 'distancia_m' => 200],
            ['estilo' => '400 Estilos', 'distancia_m' => 400],
        ];

        $ordem = 1;
        foreach ($provasIndividuaisData as $prova) {
            // Create for Masculino
            Prova::updateOrCreate(
                [
                    'estilo' => $prova['estilo'],
                    'genero' => 'M',
                    'distancia_m' => $prova['distancia_m'],
                ],
                [
                    'ordem_prova' => $ordem,
                    'competicao_id' => null,
                ]
            );

            // Create for Feminino
            Prova::updateOrCreate(
                [
                    'estilo' => $prova['estilo'],
                    'genero' => 'F',
                    'distancia_m' => $prova['distancia_m'],
                ],
                [
                    'ordem_prova' => $ordem,
                    'competicao_id' => null,
                ]
            );

            $ordem++;
        }

        // Provas de Estafetas
        $provasEstafetasData = [
            ['estilo' => '4x50 Livres', 'distancia_m' => 200],
            ['estilo' => '4x100 Livres', 'distancia_m' => 400],
            ['estilo' => '4x200 Livres', 'distancia_m' => 800],
            ['estilo' => '4x50 Estilos', 'distancia_m' => 200],
            ['estilo' => '4x100 Estilos', 'distancia_m' => 400],
            ['estilo' => '4x100 Livres Mista', 'distancia_m' => 400],
            ['estilo' => '4x100 Estilos Mista', 'distancia_m' => 400],
            ['estilo' => '4x50 Livres Mista', 'distancia_m' => 200],
            ['estilo' => '4x50 Estilos Mista', 'distancia_m' => 200],
        ];

        $ordem = 1;
        foreach ($provasEstafetasData as $prova) {
            Prova::updateOrCreate(
                [
                    'estilo' => $prova['estilo'],
                    'distancia_m' => $prova['distancia_m'],
                    'genero' => 'Mista',
                ],
                [
                    'ordem_prova' => $ordem,
                    'competicao_id' => null,
                ]
            );

            $ordem++;
        }
    }
}
