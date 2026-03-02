<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\EventTypeConfig;
use App\Models\CostCenter;
use App\Models\User;
use App\Models\AgeGroup;
use Carbon\Carbon;

class EventoDadosTeste extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buscar dados necessários
        $admin = User::where('perfil', 'admin')->first();
        $trainador = User::where('perfil', 'treinador')->first() ?? $admin;

        if (!$admin) {
            $this->command->warn('⚠ Nenhum usuário administrador encontrado. Pulando criação de eventos.');
            return;
        }

        $treino = EventTypeConfig::where('nome', 'Treino')->first();
        $prova = EventTypeConfig::where('nome', 'Prova')->first();
        $competicao = EventTypeConfig::where('nome', 'Competição')->first();

        $costFormacao = CostCenter::where('codigo', 'FORM')->first();
        $costCompeticao = CostCenter::where('codigo', 'COMP')->first();
        $costTransporte = CostCenter::where('codigo', 'TRANSP')->first();

        $ageGroups = AgeGroup::where('ativo', true)->pluck('id')->toArray();

        if (empty($ageGroups)) {
            $this->command->warn('⚠ Nenhum escalão etário encontrado. Pulando criação de eventos.');
            return;
        }

        // ===== EVENTOS DE TREINO =====
        $treinos = [
            [
                'titulo' => 'Treino Piscina Curta - Terça-feira',
                'descricao' => 'Treino regular em piscina de 25m. Todos os escalões bem-vindos.',
                'data_inicio' => now()->addDays(1)->format('Y-m-d'),
                'hora_inicio' => '18:00',
                'tipo' => 'treino',
                'tipo_config_id' => $treino?->id,
                'tipo_piscina' => '25m',
                'visibilidade' => 'interno',
                'local' => 'Piscina Municipal',
                'transporte_necessario' => false,
                'centro_custo_id' => $costFormacao?->id,
                'estado' => 'agendado',
                'criado_por' => $trainador->id,
            ],
            [
                'titulo' => 'Treino Piscina Longa - Quinta-feira',
                'descricao' => 'Treino em piscina de 50m para preparação de provas.',
                'data_inicio' => now()->addDays(3)->format('Y-m-d'),
                'hora_inicio' => '19:00',
                'tipo' => 'treino',
                'tipo_config_id' => $treino?->id,
                'tipo_piscina' => '50m',
                'visibilidade' => 'interno',
                'local' => 'Piscina Olímpica',
                'transporte_necessario' => true,
                'hora_partida' => '18:30',
                'local_partida' => 'Sede do Clube',
                'centro_custo_id' => $costFormacao?->id,
                'estado' => 'agendado',
                'criado_por' => $trainador->id,
            ],
            [
                'titulo' => 'Treino Técnico - Sábado',
                'descricao' => 'Treino focado em técnica e aperfeiçoamento de nados.',
                'data_inicio' => now()->addDays(5)->format('Y-m-d'),
                'hora_inicio' => '10:00',
                'tipo' => 'treino',
                'tipo_config_id' => $treino?->id,
                'tipo_piscina' => '25m',
                'visibilidade' => 'interno',
                'local' => 'Piscina Municipal',
                'transporte_necessario' => false,
                'centro_custo_id' => $costFormacao?->id,
                'estado' => 'agendado',
                'criado_por' => $trainador->id,
            ],
        ];

        foreach ($treinos as $treinoData) {
            $evento = Event::create($treinoData);
            
            // Sincronizar escalões (todos os escalões para treinos)
            $evento->syncAgeGroups($ageGroups);
            
            $this->command->line("✓ Treino criado: {$evento->titulo}");
        }

        // ===== PROVAS/COMPETIÇÕES =====
        $provas = [
            [
                'titulo' => 'Campeonato Regional - 50m Livres',
                'descricao' => 'Campeonato regional de piscina curta. Provas de velocidade.',
                'data_inicio' => now()->addDays(14)->format('Y-m-d'),
                'hora_inicio' => '09:00',
                'tipo' => 'prova',
                'tipo_config_id' => $prova?->id,
                'tipo_piscina' => '25m',
                'visibilidade' => 'publico',
                'local' => 'Piscina Municipal',
                'transporte_necessario' => true,
                'hora_partida' => '08:00',
                'local_partida' => 'Sede do Clube',
                'taxa_inscricao' => 150.00,
                'custo_inscricao_por_prova' => 15.00,
                'centro_custo_id' => $costCompeticao?->id,
                'observacoes' => 'Inscrições obrigatórias até 3 dias antes.',
                'convocatoria_ficheiro' => null,
                'estado' => 'agendado',
                'criado_por' => $admin->id,
            ],
            [
                'titulo' => 'Prova de Estafeta - Águas Abertas',
                'descricao' => 'Prova de estafeta em águas abertas. Apenas para escalões superiores.',
                'data_inicio' => now()->addDays(21)->format('Y-m-d'),
                'hora_inicio' => '10:00',
                'tipo' => 'competição',
                'tipo_config_id' => $competicao?->id,
                'tipo_piscina' => 'águas abertas',
                'visibilidade' => 'publico',
                'local' => 'Praia da Nazaré',
                'transporte_necessario' => true,
                'hora_partida' => '08:30',
                'local_partida' => 'Sede do Clube',
                'taxa_inscricao' => 200.00,
                'custo_inscricao_por_estafeta' => 50.00,
                'centro_custo_id' => $costCompeticao?->id,
                'observacoes' => 'Será necessário transporte e alojamento.',
                'estado' => 'agendado',
                'criado_por' => $admin->id,
            ],
            [
                'titulo' => 'Torneio Interno - Velocidade',
                'descricao' => 'Torneio interno entre atletas do clube.',
                'data_inicio' => now()->addDays(10)->format('Y-m-d'),
                'hora_inicio' => '15:00',
                'tipo' => 'prova',
                'tipo_config_id' => $prova?->id,
                'tipo_piscina' => '50m',
                'visibilidade' => 'privado',
                'local' => 'Piscina Olímpica',
                'transporte_necessario' => true,
                'hora_partida' => '14:00',
                'local_partida' => 'Sede do Clube',
                'taxa_inscricao' => 50.00,
                'custo_inscricao_por_prova' => 5.00,
                'centro_custo_id' => $costFormacao?->id,
                'observacoes' => 'Evento apenas para membros do clube.',
                'estado' => 'agendado',
                'criado_por' => $trainador->id,
            ],
        ];

        foreach ($provas as $provaData) {
            $evento = Event::create($provaData);
            
            // Sincronizar escalões selecionados
            $escaloesSelecionados = array_slice($ageGroups, 0, 4); // Primeiros 4 escalões
            $evento->syncAgeGroups($escaloesSelecionados);
            
            $this->command->line("✓ Prova criada: {$evento->titulo}");
        }

        // ===== EVENTOS RECORRENTES (Treinos semanais) =====
        $treinoRecorrente = Event::create([
            'titulo' => 'Treino Recorrente - Terças e Sextas',
            'descricao' => 'Treinos regulares terça e sexta-feira.',
            'data_inicio' => now()->addDays(1)->format('Y-m-d'),
            'hora_inicio' => '19:00',
            'tipo' => 'treino',
            'tipo_config_id' => $treino?->id,
            'tipo_piscina' => '25m',
            'visibilidade' => 'interno',
            'local' => 'Piscina Municipal',
            'transporte_necessario' => false,
            'centro_custo_id' => $costFormacao?->id,
            'recorrente' => true,
            'recorrencia_data_inicio' => now()->addDays(1)->format('Y-m-d'),
            'recorrencia_data_fim' => now()->addMonths(3)->format('Y-m-d'),
            'recorrencia_dias_semana' => [2, 5], // Terça (2) e Sexta (5)
            'estado' => 'agendado',
            'criado_por' => $trainador->id,
        ]);

        $treinoRecorrente->syncAgeGroups($ageGroups);
        $this->command->line("✓ Treino recorrente criado: {$treinoRecorrente->titulo}");

        $this->command->info("\n✅ DADOS DE TESTE DO MÓDULO DE EVENTOS CRIADOS COM SUCESSO!");
    }
}
