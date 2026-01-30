<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('seasons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nome');
            $table->string('ano_temporada', 20);
            $table->date('data_inicio');
            $table->date('data_fim');
            $table->string('tipo', 30);
            $table->string('estado', 30);
            $table->string('piscina_principal', 30)->nullable();
            $table->json('escaloes_abrangidos')->nullable();
            $table->text('descricao')->nullable();
            $table->json('provas_alvo')->nullable();
            $table->integer('volume_total_previsto')->nullable();
            $table->integer('volume_medio_semanal')->nullable();
            $table->integer('num_semanas_previsto')->nullable();
            $table->integer('num_competicoes_previstas')->nullable();
            $table->text('objetivos_performance')->nullable();
            $table->text('objetivos_tecnicos')->nullable();
            $table->timestamps();
            
            $table->index('ano_temporada');
            $table->index('estado');
            $table->index('data_inicio');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seasons');
    }
};
