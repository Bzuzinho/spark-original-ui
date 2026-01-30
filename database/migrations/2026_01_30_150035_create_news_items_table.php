<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('news_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('titulo');
            $table->text('conteudo');
            $table->string('imagem')->nullable();
            $table->boolean('destaque')->default(false);
            $table->uuid('autor');
            $table->datetime('data_publicacao');
            $table->json('categorias');
            $table->timestamps();
            
            $table->foreign('autor')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('data_publicacao');
            $table->index('destaque');
            $table->index('autor');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news_items');
    }
};
