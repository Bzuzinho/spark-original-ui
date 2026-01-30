<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('automated_communications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nome');
            $table->string('tipo_trigger', 50);
            $table->string('tipo_comunicacao', 30)->default('email');
            $table->string('assunto');
            $table->text('template_mensagem');
            $table->boolean('ativo')->default(true);
            $table->json('condicoes')->nullable();
            $table->timestamps();
            
            $table->index('tipo_trigger');
            $table->index('ativo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automated_communications');
    }
};
