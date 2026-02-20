<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('titulo');
            $table->text('descricao');
            $table->date('data_inicio');
            $table->time('hora_inicio')->nullable();
            $table->date('data_fim')->nullable();
            $table->time('hora_fim')->nullable();
            $table->string('local')->nullable();
            $table->text('local_detalhes')->nullable();
            $table->string('tipo', 50);
            $table->uuid('tipo_config_id')->nullable();
            $table->string('tipo_piscina', 30)->nullable();
            $table->string('visibilidade', 20)->default('publico');
            $table->json('escaloes_elegiveis')->nullable();
            $table->boolean('transporte_necessario')->default(false);
            $table->text('transporte_detalhes')->nullable();
            $table->time('hora_partida')->nullable();
            $table->string('local_partida')->nullable();
            $table->decimal('taxa_inscricao', 10, 2)->nullable();
            $table->decimal('custo_inscricao_por_prova', 10, 2)->nullable();
            $table->decimal('custo_inscricao_por_salto', 10, 2)->nullable();
            $table->decimal('custo_inscricao_estafeta', 10, 2)->nullable();
            $table->uuid('centro_custo_id')->nullable();
            $table->text('observacoes')->nullable();
            $table->string('convocatoria_ficheiro')->nullable();
            $table->string('regulamento_ficheiro')->nullable();
            $table->string('estado', 30)->default('rascunho');
            $table->uuid('criado_por');
            $table->boolean('recorrente')->default(false);
            $table->date('recorrencia_data_inicio')->nullable();
            $table->date('recorrencia_data_fim')->nullable();
            $table->json('recorrencia_dias_semana')->nullable();
            $table->uuid('evento_pai_id')->nullable();
            $table->timestamps();
            
            $table->foreign('tipo_config_id')->references('id')->on('event_type_configs')->onDelete('set null');
            $table->foreign('centro_custo_id')->references('id')->on('cost_centers')->onDelete('set null');
            $table->foreign('criado_por')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('evento_pai_id')->references('id')->on('events')->onDelete('cascade');
            
            $table->index('tipo');
            $table->index('estado');
            $table->index('data_inicio');
            $table->index('visibilidade');
            $table->index('criado_por');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
