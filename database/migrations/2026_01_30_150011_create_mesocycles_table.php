<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('mesocycles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('macrociclo_id');
            $table->string('nome');
            $table->string('foco');
            $table->date('data_inicio');
            $table->date('data_fim');
            $table->timestamps();
            
            $table->foreign('macrociclo_id')->references('id')->on('macrocycles')->onDelete('cascade');
            
            $table->index('macrociclo_id');
            $table->index('data_inicio');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mesocycles');
    }
};
