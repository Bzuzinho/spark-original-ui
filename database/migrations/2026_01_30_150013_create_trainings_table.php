<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('trainings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('numero_treino')->nullable();
            $table->date('data');
            $table->time('hora_inicio')->nullable();
            $table->time('hora_fim')->nullable();
            $table->string('local')->nullable();
            $table->uuid('epoca_id')->nullable();
            $table->uuid('microciclo_id')->nullable();
            $table->uuid('grupo_escalao_id')->nullable();
            $table->json('escaloes')->nullable();
            $table->string('tipo_treino', 30);
            $table->integer('volume_planeado_m')->nullable();
            $table->text('notas_gerais')->nullable();
            $table->text('descricao_treino')->nullable();
            $table->uuid('criado_por')->nullable();
            $table->uuid('evento_id')->nullable();
            $table->datetime('atualizado_em')->nullable();
            $table->timestamps();
            
            $table->foreign('epoca_id')->references('id')->on('seasons')->onDelete('set null');
            $table->foreign('microciclo_id')->references('id')->on('microcycles')->onDelete('set null');
            $table->foreign('criado_por')->references('id')->on('users')->onDelete('set null');
            $table->foreign('evento_id')->references('id')->on('events')->onDelete('set null');
            
            $table->index('data');
            $table->index('epoca_id');
            $table->index('microciclo_id');
            $table->index('tipo_treino');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainings');
    }
};
