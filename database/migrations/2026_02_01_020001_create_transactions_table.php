<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignUuid('category_id')->nullable()->constrained('financial_categories')->onDelete('set null');
            $table->string('descricao');
            $table->decimal('valor', 10, 2);
            $table->enum('tipo', ['receita', 'despesa']);
            $table->date('data');
            $table->enum('metodo_pagamento', ['dinheiro', 'transferencia', 'mbway', 'multibanco', 'cartao'])->nullable();
            $table->string('comprovativo')->nullable();
            $table->enum('estado', ['paga', 'pendente', 'cancelada'])->default('pendente');
            $table->text('observacoes')->nullable();
            $table->timestamps();
            
            $table->index('data');
            $table->index('estado');
            $table->index('tipo');
            $table->index('user_id');
            $table->index('category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
