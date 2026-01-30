<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('movement_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('movimento_id');
            $table->string('descricao');
            $table->decimal('valor_unitario', 10, 2);
            $table->integer('quantidade')->default(1);
            $table->decimal('imposto_percentual', 5, 2)->default(0);
            $table->decimal('total_linha', 10, 2);
            $table->uuid('produto_id')->nullable();
            $table->uuid('centro_custo_id')->nullable();
            $table->uuid('fatura_id')->nullable();
            $table->timestamps();
            
            $table->foreign('movimento_id')->references('id')->on('movements')->onDelete('cascade');
            $table->foreign('centro_custo_id')->references('id')->on('cost_centers')->onDelete('set null');
            
            $table->index('movimento_id');
            $table->index('produto_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movement_items');
    }
};
