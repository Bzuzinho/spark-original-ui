<?php

namespace Database\Seeders;

use App\Models\ProvaTipo;
use Illuminate\Database\Seeder;

class ProvaTipoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Provas Individuais - Natação
        $provasTipos = [
            // Livres
            ['nome' => '50 Livres', 'distancia' => 50, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '100 Livres', 'distancia' => 100, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '200 Livres', 'distancia' => 200, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '400 Livres', 'distancia' => 400, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '800 Livres', 'distancia' => 800, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '1500 Livres', 'distancia' => 1500, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],

            // Costas
            ['nome' => '50 Costas', 'distancia' => 50, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '100 Costas', 'distancia' => 100, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '200 Costas', 'distancia' => 200, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],

            // Bruços
            ['nome' => '50 Bruços', 'distancia' => 50, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '100 Bruços', 'distancia' => 100, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '200 Bruços', 'distancia' => 200, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],

            // Mariposa
            ['nome' => '50 Mariposa', 'distancia' => 50, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '100 Mariposa', 'distancia' => 100, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '200 Mariposa', 'distancia' => 200, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],

            // Estilos
            ['nome' => '100 Estilos', 'distancia' => 100, 'unidade' => 'm', 'modalidade' => 'Natação (Piscina Curta)', 'ativo' => true],
            ['nome' => '200 Estilos', 'distancia' => 200, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '400 Estilos', 'distancia' => 400, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],

            // Estafetas
            ['nome' => '4x50 Livres', 'distancia' => 200, 'unidade' => 'm', 'modalidade' => 'Natação (Piscina Curta)', 'ativo' => true],
            ['nome' => '4x100 Livres', 'distancia' => 400, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '4x200 Livres', 'distancia' => 800, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '4x50 Estilos', 'distancia' => 200, 'unidade' => 'm', 'modalidade' => 'Natação (Piscina Curta)', 'ativo' => true],
            ['nome' => '4x100 Estilos', 'distancia' => 400, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '4x100 Livres Mista', 'distancia' => 400, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '4x100 Estilos Mista', 'distancia' => 400, 'unidade' => 'm', 'modalidade' => 'Natação', 'ativo' => true],
            ['nome' => '4x50 Livres Mista', 'distancia' => 200, 'unidade' => 'm', 'modalidade' => 'Natação (Piscina Curta)', 'ativo' => true],
            ['nome' => '4x50 Estilos Mista', 'distancia' => 200, 'unidade' => 'm', 'modalidade' => 'Natação (Piscina Curta)', 'ativo' => true],
        ];

        foreach ($provasTipos as $provaTipo) {
            ProvaTipo::updateOrCreate(
                ['nome' => $provaTipo['nome']],
                $provaTipo
            );
        }
    }
}
