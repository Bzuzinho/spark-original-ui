<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('event_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('evento_id');
            $table->uuid('user_id');
            $table->string('prova');
            $table->string('tempo')->nullable();
            $table->integer('classificacao')->nullable();
            $table->string('piscina')->nullable();
            $table->string('escalao')->nullable();
            $table->text('observacoes')->nullable();
            $table->string('epoca')->nullable();
            $table->uuid('registado_por');
            $table->datetime('registado_em');
            $table->timestamps();
            
            $table->foreign('evento_id')->references('id')->on('events')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('registado_por')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('evento_id');
            $table->index('user_id');
            $table->index('prova');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_results');
    }
};
