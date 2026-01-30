<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('competitions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nome');
            $table->string('local');
            $table->date('data_inicio');
            $table->date('data_fim')->nullable();
            $table->string('tipo', 30);
            $table->uuid('evento_id')->nullable();
            $table->timestamps();
            
            $table->foreign('evento_id')->references('id')->on('events')->onDelete('set null');
            
            $table->index('data_inicio');
            $table->index('tipo');
            $table->index('evento_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competitions');
    }
};
