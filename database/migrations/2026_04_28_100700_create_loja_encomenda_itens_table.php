<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('loja_encomenda_itens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('loja_encomenda_id');
            $table->uuid('loja_produto_id');
            $table->uuid('loja_produto_variante_id')->nullable();
            $table->string('descricao');
            $table->integer('quantidade');
            $table->decimal('preco_unitario', 10, 2);
            $table->decimal('total_linha', 10, 2);
            $table->timestamps();

            $table->foreign('loja_encomenda_id')->references('id')->on('loja_encomendas')->cascadeOnDelete();
            $table->foreign('loja_produto_id')->references('id')->on('loja_produtos')->restrictOnDelete();
            $table->foreign('loja_produto_variante_id')->references('id')->on('loja_produto_variantes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loja_encomenda_itens');
    }
};