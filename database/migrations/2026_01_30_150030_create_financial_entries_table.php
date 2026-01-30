<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('financial_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->date('data');
            $table->string('tipo', 30);
            $table->string('categoria')->nullable();
            $table->string('descricao');
            $table->decimal('valor', 10, 2);
            $table->uuid('centro_custo_id')->nullable();
            $table->uuid('user_id')->nullable();
            $table->uuid('fatura_id')->nullable();
            $table->string('metodo_pagamento')->nullable();
            $table->string('comprovativo')->nullable();
            $table->timestamps();
            
            $table->foreign('centro_custo_id')->references('id')->on('cost_centers')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            
            $table->index('data');
            $table->index('tipo');
            $table->index('centro_custo_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_entries');
    }
};
