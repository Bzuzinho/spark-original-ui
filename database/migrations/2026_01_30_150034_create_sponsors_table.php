<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('sponsors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nome');
            $table->string('logo')->nullable();
            $table->string('tipo', 30);
            $table->date('contrato_inicio');
            $table->date('contrato_fim')->nullable();
            $table->decimal('valor_anual', 10, 2)->nullable();
            $table->string('contacto_nome')->nullable();
            $table->string('contacto_email')->nullable();
            $table->string('contacto_telefone')->nullable();
            $table->boolean('ativo')->default(true);
            $table->timestamps();
            
            $table->index('tipo');
            $table->index('ativo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsors');
    }
};
