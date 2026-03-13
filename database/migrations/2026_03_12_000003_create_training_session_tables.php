<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('training_session_attendance')) {
            Schema::create('training_session_attendance', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('training_session_id');
                $table->uuid('user_id');
                $table->boolean('presente')->default(true);
                $table->string('estado')->default('presente');
                $table->integer('volume_real_m')->nullable();
                $table->integer('rpe')->nullable();
                $table->text('observacoes_tecnicas')->nullable();
                $table->timestamps();

                $table->foreign('training_session_id')->references('id')->on('training_sessions')->cascadeOnDelete();
                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
                $table->unique(['training_session_id', 'user_id']);
                $table->index(['presente']);
                $table->index(['estado']);
            });
        }

        if (!Schema::hasTable('training_session_metrics')) {
            Schema::create('training_session_metrics', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('training_session_id');
                $table->uuid('user_id');
                $table->integer('volume_m')->nullable();
                $table->integer('rpe')->nullable();
                $table->string('zona_treino')->nullable();
                $table->string('tipo_metrica')->nullable();
                $table->decimal('valor', 10, 2)->nullable();
                $table->timestamps();

                $table->foreign('training_session_id')->references('id')->on('training_sessions')->cascadeOnDelete();
                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
                $table->index(['training_session_id', 'user_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('training_session_metrics');
        Schema::dropIfExists('training_session_attendance');
    }
};
