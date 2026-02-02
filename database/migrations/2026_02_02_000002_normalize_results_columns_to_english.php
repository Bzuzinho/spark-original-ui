<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::table('results', function (Blueprint $table) {
            // Rename Portuguese columns to English
            $table->renameColumn('tempo_oficial', 'official_time');
            $table->renameColumn('posicao', 'position');
            $table->renameColumn('pontos_fina', 'fina_points');
            $table->renameColumn('desclassificado', 'disqualified');
            $table->renameColumn('observacoes', 'notes');
        });
    }

    public function down(): void
    {
        Schema::table('results', function (Blueprint $table) {
            // Reverse the column renames
            $table->renameColumn('official_time', 'tempo_oficial');
            $table->renameColumn('position', 'posicao');
            $table->renameColumn('fina_points', 'pontos_fina');
            $table->renameColumn('disqualified', 'desclassificado');
            $table->renameColumn('notes', 'observacoes');
        });
    }
};
