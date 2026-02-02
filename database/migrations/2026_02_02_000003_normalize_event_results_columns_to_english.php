<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::table('event_results', function (Blueprint $table) {
            // Rename Portuguese columns to English
            $table->renameColumn('evento_id', 'event_id');
            $table->renameColumn('prova', 'race');
            $table->renameColumn('tempo', 'time');
            $table->renameColumn('classificacao', 'classification');
            $table->renameColumn('piscina', 'pool');
            $table->renameColumn('escalao', 'age_group');
            $table->renameColumn('observacoes', 'notes');
            $table->renameColumn('epoca', 'season');
            $table->renameColumn('registado_por', 'registered_by');
            $table->renameColumn('registado_em', 'registered_at');
        });
    }

    public function down(): void
    {
        Schema::table('event_results', function (Blueprint $table) {
            // Reverse the column renames
            $table->renameColumn('event_id', 'evento_id');
            $table->renameColumn('race', 'prova');
            $table->renameColumn('time', 'tempo');
            $table->renameColumn('classification', 'classificacao');
            $table->renameColumn('pool', 'piscina');
            $table->renameColumn('age_group', 'escalao');
            $table->renameColumn('notes', 'observacoes');
            $table->renameColumn('season', 'epoca');
            $table->renameColumn('registered_by', 'registado_por');
            $table->renameColumn('registered_at', 'registado_em');
        });
    }
};
