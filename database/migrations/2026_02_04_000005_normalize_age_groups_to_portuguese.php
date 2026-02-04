<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::table('age_groups', function (Blueprint $table) {
            // Rename columns to Portuguese
            $table->renameColumn('name', 'nome');
            $table->renameColumn('description', 'descricao');
            $table->renameColumn('min_age', 'idade_minima');
            $table->renameColumn('max_age', 'idade_maxima');
            $table->renameColumn('min_year', 'ano_minimo');
            $table->renameColumn('max_year', 'ano_maximo');
            $table->renameColumn('active', 'ativo');
        });
    }

    public function down(): void
    {
        Schema::table('age_groups', function (Blueprint $table) {
            // Rename back to English
            $table->renameColumn('nome', 'name');
            $table->renameColumn('descricao', 'description');
            $table->renameColumn('idade_minima', 'min_age');
            $table->renameColumn('idade_maxima', 'max_age');
            $table->renameColumn('ano_minimo', 'min_year');
            $table->renameColumn('ano_maximo', 'max_year');
            $table->renameColumn('ativo', 'active');
        });
    }
};
