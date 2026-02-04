<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::table('user_types', function (Blueprint $table) {
            // Rename columns to Portuguese
            $table->renameColumn('name', 'nome');
            $table->renameColumn('description', 'descricao');
            $table->renameColumn('active', 'ativo');
        });
    }

    public function down(): void
    {
        Schema::table('user_types', function (Blueprint $table) {
            // Rename back to English
            $table->renameColumn('nome', 'name');
            $table->renameColumn('descricao', 'description');
            $table->renameColumn('ativo', 'active');
        });
    }
};
