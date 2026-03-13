<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('training_metrics')) {
            Schema::create('training_metrics', function (Blueprint $table) {
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

                $table->foreign('treino_id')->references('id')->on('trainings')->cascadeOnDelete();
                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
                $table->foreign('registado_por')->references('id')->on('users')->nullOnDelete();
                $table->foreign('atualizado_por')->references('id')->on('users')->nullOnDelete();

                $table->index(['treino_id', 'user_id'], 'idx_training_metrics_treino_user');
                $table->index(['treino_id', 'user_id', 'ordem'], 'idx_training_metrics_treino_user_ordem');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('training_metrics');
    }
};
