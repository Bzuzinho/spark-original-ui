<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('provas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('competicao_id');
            $table->string('estilo', 30);
            $table->integer('distancia_m');
            $table->string('genero', 20);
            $table->uuid('escalao_id')->nullable();
            $table->integer('ordem_prova')->nullable();
            $table->timestamps();
            
            $table->foreign('competicao_id')->references('id')->on('competitions')->onDelete('cascade');
            
            $table->index('competicao_id');
            $table->index('estilo');
            $table->index('distancia_m');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provas');
    }
};
