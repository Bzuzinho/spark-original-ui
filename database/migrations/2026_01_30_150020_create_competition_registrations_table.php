<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('competition_registrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('prova_id');
            $table->uuid('user_id');
            $table->string('estado', 30)->default('inscrito');
            $table->decimal('valor_inscricao', 10, 2)->nullable();
            $table->uuid('fatura_id')->nullable();
            $table->uuid('movimento_id')->nullable();
            $table->timestamps();
            
            $table->foreign('prova_id')->references('id')->on('provas')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('prova_id');
            $table->index('user_id');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competition_registrations');
    }
};
