<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('produto_id');
            $table->integer('quantidade');
            $table->decimal('preco_unitario', 10, 2);
            $table->decimal('total', 10, 2);
            $table->uuid('cliente_id')->nullable();
            $table->uuid('vendedor_id');
            $table->datetime('data');
            $table->string('metodo_pagamento', 30);
            $table->timestamps();
            
            $table->foreign('produto_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('cliente_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('vendedor_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('produto_id');
            $table->index('cliente_id');
            $table->index('vendedor_id');
            $table->index('data');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
