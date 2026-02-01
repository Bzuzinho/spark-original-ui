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
            $table->text('descricao')->nullable();
            $table->string('logo')->nullable();
            $table->string('website')->nullable();
            $table->string('contacto')->nullable();
            $table->string('email')->nullable();
            $table->enum('tipo', ['principal', 'secundario', 'apoio'])->default('secundario');
            $table->decimal('valor_anual', 10, 2)->nullable();
            $table->date('data_inicio');
            $table->date('data_fim')->nullable();
            $table->enum('estado', ['ativo', 'inativo', 'expirado'])->default('ativo');
            $table->timestamps();
            
            $table->index('tipo');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsors');
    }
};
