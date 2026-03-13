<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_athlete_cais_metrics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('treino_id');
            $table->uuid('user_id');
            $table->unsignedInteger('ordem')->default(0);
            $table->string('metrica', 120)->nullable();
            $table->string('valor', 120)->nullable();
            $table->string('tempo', 60)->nullable();
            $table->text('observacao')->nullable();
            $table->uuid('registado_por')->nullable();
            $table->uuid('atualizado_por')->nullable();
            $table->timestamps();

            $table->foreign('treino_id')->references('id')->on('trainings')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('registado_por')->references('id')->on('users')->onDelete('set null');
            $table->foreign('atualizado_por')->references('id')->on('users')->onDelete('set null');

            $table->index(['treino_id', 'user_id'], 'idx_cais_metrics_treino_user');
            $table->index(['treino_id', 'user_id', 'ordem'], 'idx_cais_metrics_treino_user_ordem');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_athlete_cais_metrics');
    }
};
