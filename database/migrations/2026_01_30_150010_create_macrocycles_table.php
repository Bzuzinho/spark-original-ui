<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('macrocycles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('epoca_id');
            $table->string('nome');
            $table->string('tipo', 50);
            $table->date('data_inicio');
            $table->date('data_fim');
            $table->string('escalao')->nullable();
            $table->timestamps();
            
            $table->foreign('epoca_id')->references('id')->on('seasons')->onDelete('cascade');
            
            $table->index('epoca_id');
            $table->index('tipo');
            $table->index('data_inicio');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('macrocycles');
    }
};
