<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * FASE 3: Migration de Suporte
     * Adiciona campos para rastrear dados legacy e migração de presences
     */
    public function up(): void
    {
        Schema::table('presences', function (Blueprint $table) {
            // Flag para distinguir registos legacy vs novos (dual write)
            $table->boolean('is_legacy')->default(true)->after('presente');
            
            // FK para training_athlete ao qual foi migrado este presence
            $table->uuid('migrated_to_training_athlete_id')->nullable()->after('is_legacy');

            // Índices para queries de auditoria/migração
            $table->index('is_legacy');
            $table->index('migrated_to_training_athlete_id');

            // FK com set null (se training_athlete apagado, manter histórico)
            $table->foreign('migrated_to_training_athlete_id')
                  ->references('id')
                  ->on('training_athletes')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('presences', function (Blueprint $table) {
            $table->dropForeign(['migrated_to_training_athlete_id']);
            $table->dropIndex(['is_legacy']);
            $table->dropIndex(['migrated_to_training_athlete_id']);
            $table->dropColumn([
                'is_legacy',
                'migrated_to_training_athlete_id',
            ]);
        });
    }
};
