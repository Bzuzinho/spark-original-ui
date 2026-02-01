<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketing_campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->enum('tipo', ['email', 'redes_sociais', 'evento', 'outro']);
            $table->date('data_inicio');
            $table->date('data_fim')->nullable();
            $table->enum('estado', ['planeada', 'ativa', 'concluida', 'cancelada'])->default('planeada');
            $table->decimal('orcamento', 10, 2)->nullable();
            $table->integer('alcance_estimado')->nullable();
            $table->text('notas')->nullable();
            $table->timestamps();
            
            $table->index('estado');
            $table->index('tipo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketing_campaigns');
    }
};
