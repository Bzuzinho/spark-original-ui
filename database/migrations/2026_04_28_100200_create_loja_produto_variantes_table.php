<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('loja_produto_variantes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('loja_produto_id');
            $table->string('nome')->nullable();
            $table->string('tamanho', 80)->nullable();
            $table->string('cor', 80)->nullable();
            $table->string('sku', 120)->nullable()->unique();
            $table->decimal('preco_extra', 10, 2)->default(0);
            $table->integer('stock_atual')->default(0);
            $table->boolean('ativo')->default(true);
            $table->timestamps();

            $table->foreign('loja_produto_id')->references('id')->on('loja_produtos')->cascadeOnDelete();
            $table->index(['loja_produto_id', 'ativo'], 'loja_produto_variantes_produto_ativo_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loja_produto_variantes');
    }
};