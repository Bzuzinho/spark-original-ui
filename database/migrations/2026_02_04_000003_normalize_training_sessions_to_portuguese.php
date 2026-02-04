<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::table('training_sessions', function (Blueprint $table) {
            // Rename columns to Portuguese
            $table->renameColumn('team_id', 'equipa_id');
            $table->renameColumn('datetime', 'data_hora');
            $table->renameColumn('duration_minutes', 'duracao_minutos');
            $table->renameColumn('location', 'local');
            $table->renameColumn('objectives', 'objetivos');
            $table->renameColumn('status', 'estado');
        });
    }

    public function down(): void
    {
        Schema::table('training_sessions', function (Blueprint $table) {
            // Rename back to English
            $table->renameColumn('equipa_id', 'team_id');
            $table->renameColumn('data_hora', 'datetime');
            $table->renameColumn('duracao_minutos', 'duration_minutes');
            $table->renameColumn('local', 'location');
            $table->renameColumn('objetivos', 'objectives');
            $table->renameColumn('estado', 'status');
        });
    }
};
