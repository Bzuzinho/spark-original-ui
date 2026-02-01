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
            $table->string('assunto');
            $table->text('mensagem');
            $table->enum('tipo', ['email', 'sms', 'notificacao', 'aviso'])->default('email');
            $table->json('destinatarios'); // Array de IDs ou emails
            $table->enum('estado', ['rascunho', 'agendada', 'enviada', 'falhou'])->default('rascunho');
            $table->timestamp('agendado_para')->nullable();
            $table->timestamp('enviado_em')->nullable();
            $table->integer('total_enviados')->default(0);
            $table->integer('total_falhados')->default(0);
            $table->timestamps();
            
            $table->index('agendado_para');
            $table->index('enviado_em');
            $table->index('estado');
            $table->index('tipo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communications');
    }
};
