<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('training_series', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('treino_id');
            $table->integer('ordem');
            $table->text('descricao_texto');
            $table->integer('distancia_total_m');
            $table->string('zona_intensidade', 10)->nullable();
            $table->string('estilo', 30)->nullable();
            $table->integer('repeticoes')->nullable();
            $table->string('intervalo')->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();
            
            $table->foreign('treino_id')->references('id')->on('trainings')->onDelete('cascade');
            
            $table->index('treino_id');
            $table->index('ordem');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_series');
    }
};
