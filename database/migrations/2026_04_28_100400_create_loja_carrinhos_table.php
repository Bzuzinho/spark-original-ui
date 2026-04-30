<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('loja_carrinhos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('estado', 20)->default('aberto');
            $table->text('observacoes')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index(['user_id', 'estado'], 'loja_carrinhos_user_estado_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loja_carrinhos');
    }
};