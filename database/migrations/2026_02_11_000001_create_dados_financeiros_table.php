<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('dados_financeiros', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->uuid('mensalidade_id')->nullable();
            $table->decimal('conta_corrente_manual', 10, 2)->default(0);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('mensalidade_id')->references('id')->on('monthly_fees')->onDelete('set null');
            $table->index('mensalidade_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dados_financeiros');
    }
};
