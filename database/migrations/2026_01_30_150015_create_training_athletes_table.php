<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('training_athletes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('treino_id');
            $table->uuid('user_id');
            $table->boolean('presente')->default(false);
            $table->string('estado', 30)->nullable();
            $table->integer('volume_real_m')->nullable();
            $table->integer('rpe')->nullable();
            $table->text('observacoes_tecnicas')->nullable();
            $table->uuid('registado_por')->nullable();
            $table->datetime('registado_em')->nullable();
            $table->timestamps();
            
            $table->foreign('treino_id')->references('id')->on('trainings')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('registado_por')->references('id')->on('users')->onDelete('set null');
            
            $table->index('treino_id');
            $table->index('user_id');
            $table->index('presente');
            $table->unique(['treino_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_athletes');
    }
};
