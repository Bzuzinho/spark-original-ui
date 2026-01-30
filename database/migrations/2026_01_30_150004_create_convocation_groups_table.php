<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('convocation_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('evento_id');
            $table->datetime('data_criacao');
            $table->uuid('criado_por');
            $table->json('atletas_ids');
            $table->time('hora_encontro')->nullable();
            $table->string('local_encontro')->nullable();
            $table->text('observacoes')->nullable();
            $table->string('tipo_custo', 30);
            $table->decimal('valor_por_salto', 10, 2)->nullable();
            $table->decimal('valor_por_estafeta', 10, 2)->nullable();
            $table->decimal('valor_inscricao_unitaria', 10, 2)->nullable();
            $table->decimal('valor_inscricao_calculado', 10, 2)->nullable();
            $table->uuid('movimento_id')->nullable();
            $table->timestamps();
            
            $table->foreign('evento_id')->references('id')->on('events')->onDelete('cascade');
            $table->foreign('criado_por')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('evento_id');
            $table->index('criado_por');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('convocation_groups');
    }
};
