<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * FASE 3: Migration de Suporte
     * Adiciona campos para rastrear sincronização com training_athletes
     */
    public function up(): void
    {
        Schema::table('event_attendances', function (Blueprint $table) {
            // Flag para indicar se foi sincronizado de training_athletes
            $table->boolean('synced_from_training')->default(false)->after('observacoes');
            
            // FK para o training_athlete que originou este attendance (se aplicável)
            $table->uuid('training_athlete_id')->nullable()->after('synced_from_training');

            // Índices para performance
            $table->index('synced_from_training');
            $table->index('training_athlete_id');
            
            // FK com cascade suave (set null se training_athlete apagado)
            $table->foreign('training_athlete_id')
                  ->references('id')
                  ->on('training_athletes')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('event_attendances', function (Blueprint $table) {
            $table->dropForeign(['training_athlete_id']);
            $table->dropIndex(['synced_from_training']);
            $table->dropIndex(['training_athlete_id']);
            $table->dropColumn(['synced_from_training', 'training_athlete_id']);
        });
    }
};
