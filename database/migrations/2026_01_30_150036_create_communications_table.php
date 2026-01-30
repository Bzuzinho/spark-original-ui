<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('communications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('titulo');
            $table->text('mensagem');
            $table->string('tipo', 30)->default('email');
            $table->json('destinatarios_ids');
            $table->uuid('remetente_id');
            $table->datetime('data_envio');
            $table->string('estado', 30)->default('rascunho');
            $table->json('escaloes_alvo')->nullable();
            $table->json('tipos_membro_alvo')->nullable();
            $table->timestamps();
            
            $table->foreign('remetente_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('data_envio');
            $table->index('estado');
            $table->index('tipo');
            $table->index('remetente_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communications');
    }
};
