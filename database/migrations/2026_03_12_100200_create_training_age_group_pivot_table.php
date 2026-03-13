<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('training_age_group')) {
            Schema::create('training_age_group', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('treino_id');
                $table->uuid('age_group_id');
                $table->timestamps();

                $table->foreign('treino_id')->references('id')->on('trainings')->cascadeOnDelete();
                $table->foreign('age_group_id')->references('id')->on('age_groups')->cascadeOnDelete();
                $table->unique(['treino_id', 'age_group_id'], 'uniq_training_age_group');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('training_age_group');
    }
};
