<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->date('data_fatura');
            $table->string('mes', 20)->nullable();
            $table->date('data_emissao');
            $table->date('data_vencimento');
            $table->decimal('valor_total', 10, 2);
            $table->string('estado_pagamento', 30)->default('pendente');
            $table->string('numero_recibo')->nullable();
            $table->string('referencia_pagamento')->nullable();
            $table->uuid('centro_custo_id')->nullable();
            $table->string('tipo', 30);
            $table->text('observacoes')->nullable();
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('centro_custo_id')->references('id')->on('cost_centers')->onDelete('set null');
            
            $table->index('user_id');
            $table->index('data_fatura');
            $table->index('estado_pagamento');
            $table->index('tipo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
