<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->string('imagem')->nullable();
            $table->string('categoria');
            $table->decimal('preco', 10, 2);
            $table->integer('stock')->default(0);
            $table->integer('stock_minimo')->default(0);
            $table->boolean('ativo')->default(true);
            $table->timestamps();
            
            $table->index('categoria');
            $table->index('ativo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
