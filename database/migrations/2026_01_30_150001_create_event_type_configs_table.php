<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('event_type_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nome');
            $table->string('cor', 20);
            $table->string('icon', 50);
            $table->boolean('ativo')->default(true);
            $table->boolean('gera_taxa')->default(false);
            $table->boolean('requer_convocatoria')->default(false);
            $table->boolean('requer_transporte')->default(false);
            $table->string('visibilidade_default', 20)->default('publico');
            $table->timestamps();
            
            $table->index('ativo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_type_configs');
    }
};
