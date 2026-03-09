<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ConfiguracoesDesportivoSeeder extends Seeder
{
    /**
     * Seed base data para catálogos técnicos do módulo Desportivo
     */
    public function run(): void
    {
        $this->seedAthleteStatuses();
        $this->seedTrainingTypes();
        $this->seedTrainingZones();
        $this->seedAbsenceReasons();
        $this->seedInjuryReasons();
        $this->seedPoolTypes();
    }

    private function seedAthleteStatuses(): void
    {
        $statuses = [
            ['codigo' => 'presente', 'nome' => 'Presente', 'nome_en' => 'Present', 'cor' => '#10B981', 'ordem' => 1],
            ['codigo' => 'ausente', 'nome' => 'Ausente', 'nome_en' => 'Absent', 'cor' => '#EF4444', 'ordem' => 2],
            ['codigo' => 'justificado', 'nome' => 'Ausência Justificada', 'nome_en' => 'Excused Absence', 'cor' => '#F59E0B', 'ordem' => 3],
            ['codigo' => 'lesionado', 'nome' => 'Lesionado', 'nome_en' => 'Injured', 'cor' => '#DC2626', 'ordem' => 4],
            ['codigo' => 'limitado', 'nome' => 'Treino Limitado', 'nome_en' => 'Limited Training', 'cor' => '#FBBF24', 'ordem' => 5],
            ['codigo' => 'doente', 'nome' => 'Doente', 'nome_en' => 'Sick', 'cor' => '#F87171', 'ordem' => 6],
        ];

        foreach ($statuses as $status) {
            DB::table('athlete_status_configs')->insert([
                'id' => Str::uuid(),
                'codigo' => $status['codigo'],
                'nome' => $status['nome'],
                'nome_en' => $status['nome_en'],
                'cor' => $status['cor'],
                'ativo' => true,
                'ordem' => $status['ordem'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('✅ Seeded athlete_status_configs (' . count($statuses) . ' records)');
    }

    private function seedTrainingTypes(): void
    {
        $types = [
            ['codigo' => 'tecnico', 'nome' => 'Treino Técnico', 'nome_en' => 'Technical Training', 'cor' => '#3B82F6', 'descricao' => 'Foco em técnica de nado', 'ordem' => 1],
            ['codigo' => 'resistencia', 'nome' => 'Treino de Resistência', 'nome_en' => 'Endurance Training', 'cor' => '#10B981', 'descricao' => 'Desenvolvimento aeróbico', 'ordem' => 2],
            ['codigo' => 'velocidade', 'nome' => 'Treino de Velocidade', 'nome_en' => 'Speed Training', 'cor' => '#F59E0B', 'descricao' => 'Treino anaeróbico e velocidade', 'ordem' => 3],
            ['codigo' => 'forca', 'nome' => 'Treino de Força', 'nome_en' => 'Strength Training', 'cor' => '#8B5CF6', 'descricao' => 'Força e potência muscular', 'ordem' => 4],
            ['codigo' => 'tapering', 'nome' => 'Tapering', 'nome_en' => 'Tapering', 'cor' => '#EC4899', 'descricao' => 'Redução de carga pré-competição', 'ordem' => 5],
            ['codigo' => 'regeneracao', 'nome' => 'Regeneração', 'nome_en' => 'Recovery', 'cor' => '#06B6D4', 'descricao' => 'Treino regenerativo/recuperação', 'ordem' => 6],
            ['codigo' => 'misto', 'nome' => 'Treino Misto', 'nome_en' => 'Mixed Training', 'cor' => '#6366F1', 'descricao' => 'Combinação de vários tipos', 'ordem' => 7],
        ];

        foreach ($types as $type) {
            DB::table('training_type_configs')->insert([
                'id' => Str::uuid(),
                'codigo' => $type['codigo'],
                'nome' => $type['nome'],
                'nome_en' => $type['nome_en'],
                'cor' => $type['cor'],
                'descricao' => $type['descricao'],
                'ativo' => true,
                'ordem' => $type['ordem'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('✅ Seeded training_type_configs (' . count($types) . ' records)');
    }

    private function seedTrainingZones(): void
    {
        $zones = [
            ['codigo' => 'Z1', 'nome' => 'Zona 1 - Recuperação', 'percentagem_min' => 50, 'percentagem_max' => 60, 'cor' => '#DBEAFE', 'ordem' => 1],
            ['codigo' => 'Z2', 'nome' => 'Zona 2 - Aeróbica Base', 'percentagem_min' => 60, 'percentagem_max' => 70, 'cor' => '#93C5FD', 'ordem' => 2],
            ['codigo' => 'Z3', 'nome' => 'Zona 3 - Aeróbica Intensiva', 'percentagem_min' => 70, 'percentagem_max' => 80, 'cor' => '#3B82F6', 'ordem' => 3],
            ['codigo' => 'Z4', 'nome' => 'Zona 4 - Limiar Anaeróbico', 'percentagem_min' => 80, 'percentagem_max' => 90, 'cor' => '#F59E0B', 'ordem' => 4],
            ['codigo' => 'Z5', 'nome' => 'Zona 5 - VO2 Max', 'percentagem_min' => 90, 'percentagem_max' => 95, 'cor' => '#EF4444', 'ordem' => 5],
            ['codigo' => 'Z6', 'nome' => 'Zona 6 - Velocidade Máxima', 'percentagem_min' => 95, 'percentagem_max' => 100, 'cor' => '#DC2626', 'ordem' => 6],
        ];

        foreach ($zones as $zone) {
            DB::table('training_zone_configs')->insert([
                'id' => Str::uuid(),
                'codigo' => $zone['codigo'],
                'nome' => $zone['nome'],
                'percentagem_min' => $zone['percentagem_min'],
                'percentagem_max' => $zone['percentagem_max'],
                'cor' => $zone['cor'],
                'ativo' => true,
                'ordem' => $zone['ordem'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('✅ Seeded training_zone_configs (' . count($zones) . ' records)');
    }

    private function seedAbsenceReasons(): void
    {
        $reasons = [
            ['codigo' => 'doenca', 'nome' => 'Doença', 'nome_en' => 'Illness', 'requer_justificacao' => true, 'ordem' => 1],
            ['codigo' => 'lesao', 'nome' => 'Lesão', 'nome_en' => 'Injury', 'requer_justificacao' => true, 'ordem' => 2],
            ['codigo' => 'trabalho', 'nome' => 'Compromisso Profissional', 'nome_en' => 'Work Commitment', 'requer_justificacao' => false, 'ordem' => 3],
            ['codigo' => 'estudos', 'nome' => 'Compromisso Escolar', 'nome_en' => 'School Commitment', 'requer_justificacao' => false, 'ordem' => 4],
            ['codigo' => 'familia', 'nome' => 'Motivo Familiar', 'nome_en' => 'Family Reason', 'requer_justificacao' => false, 'ordem' => 5],
            ['codigo' => 'transporte', 'nome' => 'Problema de Transporte', 'nome_en' => 'Transport Issue', 'requer_justificacao' => false, 'ordem' => 6],
            ['codigo' => 'outros', 'nome' => 'Outros Motivos', 'nome_en' => 'Other Reasons', 'requer_justificacao' => false, 'ordem' => 7],
        ];

        foreach ($reasons as $reason) {
            DB::table('absence_reason_configs')->insert([
                'id' => Str::uuid(),
                'codigo' => $reason['codigo'],
                'nome' => $reason['nome'],
                'nome_en' => $reason['nome_en'],
                'requer_justificacao' => $reason['requer_justificacao'],
                'ativo' => true,
                'ordem' => $reason['ordem'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('✅ Seeded absence_reason_configs (' . count($reasons) . ' records)');
    }

    private function seedInjuryReasons(): void
    {
        $injuries = [
            ['codigo' => 'muscular', 'nome' => 'Lesão Muscular', 'nome_en' => 'Muscle Injury', 'gravidade' => 'media', 'ordem' => 1],
            ['codigo' => 'articular', 'nome' => 'Lesão Articular', 'nome_en' => 'Joint Injury', 'gravidade' => 'grave', 'ordem' => 2],
            ['codigo' => 'tendinite', 'nome' => 'Tendinite', 'nome_en' => 'Tendinitis', 'gravidade' => 'media', 'ordem' => 3],
            ['codigo' => 'ombro', 'nome' => 'Lesão de Ombro', 'nome_en' => 'Shoulder Injury', 'gravidade' => 'grave', 'ordem' => 4],
            ['codigo' => 'joelho', 'nome' => 'Lesão de Joelho', 'nome_en' => 'Knee Injury', 'gravidade' => 'grave', 'ordem' => 5],
            ['codigo' => 'fadiga', 'nome' => 'Fadiga/Overtraining', 'nome_en' => 'Fatigue/Overtraining', 'gravidade' => 'leve', 'ordem' => 6],
            ['codigo' => 'outros', 'nome' => 'Outras Lesões', 'nome_en' => 'Other Injuries', 'gravidade' => 'media', 'ordem' => 7],
        ];

        foreach ($injuries as $injury) {
            DB::table('injury_reason_configs')->insert([
                'id' => Str::uuid(),
                'codigo' => $injury['codigo'],
                'nome' => $injury['nome'],
                'nome_en' => $injury['nome_en'],
                'gravidade' => $injury['gravidade'],
                'ativo' => true,
                'ordem' => $injury['ordem'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('✅ Seeded injury_reason_configs (' . count($injuries) . ' records)');
    }

    private function seedPoolTypes(): void
    {
        $pools = [
            ['codigo' => 'piscina_25m', 'nome' => 'Piscina 25m', 'comprimento_m' => 25, 'ordem' => 1],
            ['codigo' => 'piscina_50m', 'nome' => 'Piscina 50m (Olímpica)', 'comprimento_m' => 50, 'ordem' => 2],
            ['codigo' => 'mar_aberto', 'nome' => 'Mar Aberto', 'comprimento_m' => null, 'ordem' => 3],
            ['codigo' => 'lago', 'nome' => 'Lago', 'comprimento_m' => null, 'ordem' => 4],
            ['codigo' => 'rio', 'nome' => 'Rio', 'comprimento_m' => null, 'ordem' => 5],
        ];

        foreach ($pools as $pool) {
            DB::table('pool_type_configs')->insert([
                'id' => Str::uuid(),
                'codigo' => $pool['codigo'],
                'nome' => $pool['nome'],
                'comprimento_m' => $pool['comprimento_m'],
                'ativo' => true,
                'ordem' => $pool['ordem'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('✅ Seeded pool_type_configs (' . count($pools) . ' records)');
    }
}
