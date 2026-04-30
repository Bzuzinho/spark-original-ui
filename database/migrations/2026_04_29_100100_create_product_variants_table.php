<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('product_id');
            $table->string('nome')->nullable();
            $table->string('sku', 120)->nullable()->unique();
            $table->string('tamanho', 80)->nullable();
            $table->string('cor', 80)->nullable();
            $table->json('atributos_json')->nullable();
            $table->decimal('preco_extra', 10, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->integer('stock_reservado')->default(0);
            $table->boolean('ativo')->default(true);
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->index(['product_id', 'ativo'], 'product_variants_product_id_ativo_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};