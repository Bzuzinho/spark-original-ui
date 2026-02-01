<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('membership_fees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->integer('mes');
            $table->integer('ano');
            $table->decimal('valor', 10, 2);
            $table->enum('estado', ['paga', 'pendente', 'atrasada'])->default('pendente');
            $table->date('data_pagamento')->nullable();
            $table->foreignUuid('transaction_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
            
            $table->unique(['user_id', 'mes', 'ano']);
            $table->index('estado');
            $table->index('mes');
            $table->index('ano');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_fees');
    }
};
