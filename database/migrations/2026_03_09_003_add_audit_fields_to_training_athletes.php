<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * FASE 3: Migration de Suporte
     * Reforça training_athletes com campos de auditoria e índices compostos
     */
    public function up(): void
    {
        Schema::table('training_athletes', function (Blueprint $table) {
            // Campos adicionais para rastreamento de mudanças
            $table->datetime('atualizado_por_utilizador_em')->nullable()->after('registado_em');
            $table->uuid('atualizado_por')->nullable()->after('atualizado_por_utilizador_em');
            
            // Índice composto crítico para queries de presença por treino e estado
            $table->index(['treino_id', 'estado'], 'idx_training_athletes_treino_estado');
            
            // Índice composto para queries de atleta + data (via join com trainings)
            $table->index(['user_id', 'presente'], 'idx_training_athletes_user_presente');
            
            // FK para quem atualizou por último
            $table->foreign('atualizado_por')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('training_athletes', function (Blueprint $table) {
            $table->dropForeign(['atualizado_por']);
            $table->dropIndex('idx_training_athletes_treino_estado');
            $table->dropIndex('idx_training_athletes_user_presente');
            $table->dropColumn(['atualizado_por_utilizador_em', 'atualizado_por']);
        });
    }
};
