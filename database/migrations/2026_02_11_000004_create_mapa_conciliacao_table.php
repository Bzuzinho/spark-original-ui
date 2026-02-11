<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('mapa_conciliacao', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('extrato_id');
            $table->uuid('lancamento_id');
            $table->string('status', 20)->default('sugerido');
            $table->text('regra_usada')->nullable();
            $table->timestamps();

            $table->foreign('extrato_id')->references('id')->on('bank_statements')->onDelete('cascade');
            $table->foreign('lancamento_id')->references('id')->on('financial_entries')->onDelete('cascade');

            $table->index(['extrato_id', 'lancamento_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mapa_conciliacao');
    }
};
