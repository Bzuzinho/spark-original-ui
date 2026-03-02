<?php

namespace Database\Seeders;

use App\Models\EventType;
use Illuminate\Database\Seeder;

class EventTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $eventTypes = [
            [
                'nome' => 'Prova Oficial',
                'descricao' => 'Prova desportiva oficial',
                'categoria' => 'prova',
                'cor' => '#ff6b6b', // Red
                'icon' => 'medal',
                'visibilidade_default' => 'publico',
                'gera_taxa' => true,
                'permite_convocatoria' => true,
                'gera_presencas' => true,
                'requer_transporte' => true,
                'ativo' => true,
            ],
            [
                'nome' => 'Estágio',
                'descricao' => 'Estágio/concentração desportiva',
                'categoria' => 'evento',
                'cor' => '#4dabf7', // Blue
                'icon' => 'dumbbell',
                'visibilidade_default' => 'restrito',
                'gera_taxa' => true,
                'permite_convocatoria' => true,
                'gera_presencas' => true,
                'requer_transporte' => true,
                'ativo' => true,
            ],
            [
                'nome' => 'Reunião',
                'descricao' => 'Reunião geral',
                'categoria' => 'evento',
                'cor' => '#ffd43b', // Yellow
                'icon' => 'users',
                'visibilidade_default' => 'restrito',
                'gera_taxa' => false,
                'permite_convocatoria' => false,
                'gera_presencas' => false,
                'requer_transporte' => false,
                'ativo' => true,
            ],
            [
                'nome' => 'Treino',
                'descricao' => 'Sessão de treino',
                'categoria' => 'treino',
                'cor' => '#51cf66', // Green
                'icon' => 'swimmer',
                'visibilidade_default' => 'privado',
                'gera_taxa' => false,
                'permite_convocatoria' => true,
                'gera_presencas' => true,
                'requer_transporte' => false,
                'ativo' => true,
            ],
        ];

        foreach ($eventTypes as $type) {
            EventType::updateOrCreate(
                ['nome' => $type['nome']],
                $type
            );
        }
    }
}
