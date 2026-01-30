<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('event_convocations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('evento_id');
            $table->uuid('user_id');
            $table->date('data_convocatoria');
            $table->string('estado_confirmacao', 30)->default('pendente');
            $table->datetime('data_resposta')->nullable();
            $table->text('justificacao')->nullable();
            $table->text('observacoes')->nullable();
            $table->boolean('transporte_clube')->default(false);
            $table->timestamps();
            
            $table->foreign('evento_id')->references('id')->on('events')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('evento_id');
            $table->index('user_id');
            $table->index('estado_confirmacao');
            $table->unique(['evento_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_convocations');
    }
};
