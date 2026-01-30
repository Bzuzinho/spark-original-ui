<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('presences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->date('data');
            $table->uuid('treino_id')->nullable();
            $table->string('tipo', 30);
            $table->text('justificacao')->nullable();
            $table->boolean('presente')->default(false);
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('treino_id')->references('id')->on('trainings')->onDelete('set null');
            
            $table->index('user_id');
            $table->index('data');
            $table->index('treino_id');
            $table->index('tipo');
            $table->index('presente');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presences');
    }
};
