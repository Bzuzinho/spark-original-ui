<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            // Rename columns to Portuguese
            $table->renameColumn('name', 'nome');
            $table->renameColumn('age_group', 'escalao');
            $table->renameColumn('coach_id', 'treinador_id');
            $table->renameColumn('founding_year', 'ano_fundacao');
            $table->renameColumn('active', 'ativo');
        });
    }

    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            // Rename back to English
            $table->renameColumn('nome', 'name');
            $table->renameColumn('escalao', 'age_group');
            $table->renameColumn('treinador_id', 'coach_id');
            $table->renameColumn('ano_fundacao', 'founding_year');
            $table->renameColumn('ativo', 'active');
        });
    }
};
