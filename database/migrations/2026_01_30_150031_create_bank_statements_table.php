<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('bank_statements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('conta')->nullable();
            $table->date('data_movimento');
            $table->string('descricao');
            $table->decimal('valor', 10, 2);
            $table->decimal('saldo', 10, 2)->nullable();
            $table->string('referencia')->nullable();
            $table->uuid('centro_custo_id')->nullable();
            $table->boolean('conciliado')->default(false);
            $table->uuid('lancamento_id')->nullable();
            $table->timestamps();
            
            $table->foreign('centro_custo_id')->references('id')->on('cost_centers')->onDelete('set null');
            $table->foreign('lancamento_id')->references('id')->on('financial_entries')->onDelete('set null');
            
            $table->index('data_movimento');
            $table->index('conciliado');
            $table->index('lancamento_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_statements');
    }
};
