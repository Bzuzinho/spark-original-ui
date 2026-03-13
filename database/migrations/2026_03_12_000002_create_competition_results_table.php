<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('competition_results')) {
            Schema::create('competition_results', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('competition_id');
                $table->uuid('user_id');
                $table->string('prova')->nullable();
                $table->string('tempo')->nullable();
                $table->integer('colocacao')->nullable();
                $table->boolean('desqualificado')->default(false);
                $table->timestamps();

                $table->foreign('competition_id')->references('id')->on('competitions')->cascadeOnDelete();
                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
                $table->index(['competition_id', 'user_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('competition_results');
    }
};
