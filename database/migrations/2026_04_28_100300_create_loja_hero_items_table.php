<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('loja_hero_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('titulo_curto')->nullable();
            $table->string('titulo_principal');
            $table->text('descricao')->nullable();
            $table->string('texto_botao')->nullable();
            $table->string('tipo_destino', 20)->nullable();
            $table->uuid('produto_id')->nullable();
            $table->uuid('categoria_id')->nullable();
            $table->string('url_destino')->nullable();
            $table->string('imagem_desktop_path')->nullable();
            $table->string('imagem_tablet_path')->nullable();
            $table->string('imagem_mobile_path')->nullable();
            $table->string('cor_fundo', 20)->nullable();
            $table->boolean('ativo')->default(true);
            $table->integer('ordem')->default(0);
            $table->timestamp('data_inicio')->nullable();
            $table->timestamp('data_fim')->nullable();
            $table->timestamps();

            $table->foreign('produto_id')->references('id')->on('loja_produtos')->nullOnDelete();
            $table->foreign('categoria_id')->references('id')->on('item_categories')->nullOnDelete();
            $table->index(['ativo', 'ordem'], 'loja_hero_items_ativo_ordem_idx');
            $table->index(['data_inicio', 'data_fim'], 'loja_hero_items_datas_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loja_hero_items');
    }
};