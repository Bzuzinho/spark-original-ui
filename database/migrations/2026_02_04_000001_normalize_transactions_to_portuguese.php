<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Rename columns to Portuguese
            $table->renameColumn('description', 'descricao');
            $table->renameColumn('amount', 'valor');
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('date', 'data');
            $table->renameColumn('payment_method', 'metodo_pagamento');
            $table->renameColumn('receipt', 'recibo');
            $table->renameColumn('status', 'estado');
            $table->renameColumn('notes', 'observacoes');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Rename back to English
            $table->renameColumn('descricao', 'description');
            $table->renameColumn('valor', 'amount');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('data', 'date');
            $table->renameColumn('metodo_pagamento', 'payment_method');
            $table->renameColumn('recibo', 'receipt');
            $table->renameColumn('estado', 'status');
            $table->renameColumn('observacoes', 'notes');
        });
    }
};
