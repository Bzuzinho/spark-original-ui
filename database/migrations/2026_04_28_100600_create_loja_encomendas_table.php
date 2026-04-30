<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('loja_encomendas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('numero', 40)->unique();
            $table->uuid('user_id');
            $table->uuid('target_user_id')->nullable();
            $table->string('estado', 20)->default('pendente');
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->text('observacoes')->nullable();
            $table->string('origem', 20)->default('portal');
            $table->uuid('fatura_id')->nullable();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('target_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['user_id', 'estado'], 'loja_encomendas_user_estado_idx');
            $table->index(['target_user_id', 'estado'], 'loja_encomendas_target_estado_idx');
            $table->index(['estado', 'created_at'], 'loja_encomendas_estado_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loja_encomendas');
    }
};