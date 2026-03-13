<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('team_results')) {
            Schema::create('team_results', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('competicao_id');
                $table->string('equipa');
                $table->integer('classificacao')->nullable();
                $table->integer('pontos')->nullable();
                $table->text('observacoes')->nullable();
                $table->timestamps();

                $table->foreign('competicao_id')->references('id')->on('competitions')->cascadeOnDelete();
                $table->index(['competicao_id', 'classificacao']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('team_results');
    }
};
