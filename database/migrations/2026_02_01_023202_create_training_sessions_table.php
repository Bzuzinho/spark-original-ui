<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('training_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('team_id')->nullable()->constrained()->onDelete('set null');
            $table->dateTime('data_hora');
            $table->integer('duracao_minutos')->default(60);
            $table->string('local')->nullable();
            $table->text('objetivos')->nullable();
            $table->enum('estado', ['agendado', 'realizado', 'cancelado'])->default('agendado');
            $table->timestamps();
            
            $table->index('data_hora');
            $table->index('team_id');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_sessions');
    }
};
