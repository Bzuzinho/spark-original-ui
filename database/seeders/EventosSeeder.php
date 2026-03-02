<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AgeGroup;
use App\Models\EventTypeConfig;
use App\Models\CostCenter;

class EventosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ===== ESCALÕES ETÁRIOS (Age Groups) =====
        $ageGroups = [
            [
                'nome' => 'Cadetes',
                'descricao' => 'Categoria de nadadores jovens',
                'idade_minima' => 6,
                'idade_maxima' => 11,
                'ativo' => true,
            ],
            [
                'nome' => 'Juvenis A',
                'descricao' => 'Primeira categoria juvenil',
                'idade_minima' => 12,
                'idade_maxima' => 13,
                'ativo' => true,
            ],
            [
                'nome' => 'Juvenis B',
                'descricao' => 'Segunda categoria juvenil',
                'idade_minima' => 14,
                'idade_maxima' => 15,
                'ativo' => true,
            ],
            [
                'nome' => 'Juniores',
                'descricao' => 'Categoria de juniores',
                'idade_minima' => 16,
                'idade_maxima' => 17,
                'ativo' => true,
            ],
            [
                'nome' => 'Seniores',
                'descricao' => 'Categoria de seniores',
                'idade_minima' => 18,
                'idade_maxima' => 24,
                'ativo' => true,
            ],
            [
                'nome' => 'Master',
                'descricao' => 'Categoria master (25+)',
                'idade_minima' => 25,
                'idade_maxima' => 99,
                'ativo' => true,
            ],
        ];

        foreach ($ageGroups as $group) {
            AgeGroup::updateOrCreate(
                ['nome' => $group['nome']],
                $group
            );
        }

        echo "✓ {$this->command->getModel()->count()} escalões etários criados\n";

        // ===== CONFIGURAÇÕES DE TIPOS DE EVENTOS =====
        $eventTypeConfigs = [
            [
                'nome' => 'Treino',
                'descricao' => 'Sessão de treino regular',
                'cor' => '#3B82F6', // Azul
                'icon' => 'activity',
                'ativo' => true,
                'gera_taxa' => false,
                'requer_convocatoria' => false,
                'requer_transporte' => false,
                'visibilidade_default' => 'interno',
            ],
            [
                'nome' => 'Prova',
                'descricao' => 'Prova desportiva/competição',
                'cor' => '#EF4444', // Vermelho
                'icon' => 'flag',
                'ativo' => true,
                'gera_taxa' => true,
                'requer_convocatoria' => true,
                'requer_transporte' => true,
                'visibilidade_default' => 'publico',
            ],
            [
                'nome' => 'Competição',
                'descricao' => 'Evento competitivo oficial',
                'cor' => '#8B5CF6', // Roxo
                'icon' => 'award',
                'ativo' => true,
                'gera_taxa' => true,
                'requer_convocatoria' => true,
                'requer_transporte' => true,
                'visibilidade_default' => 'publico',
            ],
            [
                'nome' => 'Reunião',
                'descricao' => 'Reunião de atletas/staff',
                'cor' => '#10B981', // Verde
                'icon' => 'users',
                'ativo' => true,
                'gera_taxa' => false,
                'requer_convocatoria' => true,
                'requer_transporte' => false,
                'visibilidade_default' => 'interno',
            ],
            [
                'nome' => 'Evento Especial',
                'descricao' => 'Evento especial ou gala',
                'cor' => '#F59E0B', // Âmbar
                'icon' => 'star',
                'ativo' => true,
                'gera_taxa' => true,
                'requer_convocatoria' => true,
                'requer_transporte' => false,
                'visibilidade_default' => 'privado',
            ],
        ];

        foreach ($eventTypeConfigs as $config) {
            EventTypeConfig::updateOrCreate(
                ['nome' => $config['nome']],
                $config
            );
        }

        echo "✓ " . count($eventTypeConfigs) . " tipos de evento criados\n";

        // ===== CENTROS DE CUSTO =====
        $costCenters = [
            [
                'codigo' => 'FORM',
                'nome' => 'Formação',
                'descricao' => 'Custos com treinos e formação',
                'ativo' => true,
            ],
            [
                'codigo' => 'COMP',
                'nome' => 'Competição',
                'descricao' => 'Custos com competições e provas',
                'ativo' => true,
            ],
            [
                'codigo' => 'MAT',
                'nome' => 'Material',
                'descricao' => 'Material desportivo e equipamento',
                'ativo' => true,
            ],
            [
                'codigo' => 'TRANSP',
                'nome' => 'Transporte',
                'descricao' => 'Custos de transporte para eventos',
                'ativo' => true,
            ],
            [
                'codigo' => 'ADM',
                'nome' => 'Administrativo',
                'descricao' => 'Custos administrativos gerais',
                'ativo' => true,
            ],
        ];

        foreach ($costCenters as $center) {
            CostCenter::updateOrCreate(
                ['codigo' => $center['codigo']],
                $center
            );
        }

        echo "✓ " . count($costCenters) . " centros de custo criados\n";
    }
}
