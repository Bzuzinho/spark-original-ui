<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('result_provas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('atleta_id');
            $table->uuid('evento_id')->nullable();
            $table->string('evento_nome')->nullable();
            $table->string('prova');
            $table->string('local');
            $table->date('data');
            $table->string('piscina', 30);
            $table->string('tempo_final');
            $table->timestamps();
            
            $table->foreign('atleta_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('evento_id')->references('id')->on('events')->onDelete('set null');
            
            $table->index('atleta_id');
            $table->index('evento_id');
            $table->index('data');
            $table->index('prova');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('result_provas');
    }
};
