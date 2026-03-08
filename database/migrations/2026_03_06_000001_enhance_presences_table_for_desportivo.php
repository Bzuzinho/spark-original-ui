<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::table('presences', function (Blueprint $table) {
            // Add escalao reference if not exists
            if (!Schema::hasColumn('presences', 'escalao_id')) {
                $table->uuid('escalao_id')->nullable()->after('treino_id');
                $table->foreign('escalao_id')->references('id')->on('age_groups')->onDelete('set null');
            }
            
            // Add status field for presence classification
            if (!Schema::hasColumn('presences', 'status')) {
                $table->string('status', 50)->default('ausente')
                    ->comment('presente, ausente, justificado, atestado_medico, outro')
                    ->after('presente');
            }
            
            // Add distance/volume info
            if (!Schema::hasColumn('presences', 'distancia_realizada_m')) {
                $table->integer('distancia_realizada_m')->nullable()->after('status');
            }
            
            // Add classification/performance
            if (!Schema::hasColumn('presences', 'classificacao')) {
                $table->string('classificacao', 50)->nullable()
                    ->comment('classificação de desempenho')
                    ->after('distancia_realizada_m');
            }
            
            // Add notes
            if (!Schema::hasColumn('presences', 'notas')) {
                $table->text('notas')->nullable()->after('classificacao');
            }
        });
    }

    public function down(): void
    {
        Schema::table('presences', function (Blueprint $table) {
            if (Schema::hasColumn('presences', 'escalao_id')) {
                $table->dropForeign(['escalao_id']);
                $table->dropColumn('escalao_id');
            }

            foreach (['status', 'distancia_realizada_m', 'classificacao', 'notas'] as $column) {
                if (Schema::hasColumn('presences', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
