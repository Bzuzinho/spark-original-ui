<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('club_settings', function (Blueprint $table) {
            $table->id();
            $table->string('nome_clube');
            $table->string('sigla')->nullable();
            $table->text('morada')->nullable();
            $table->string('codigo_postal')->nullable();
            $table->string('localidade')->nullable();
            $table->string('telefone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('nif')->nullable();
            $table->text('logo_url')->nullable();
            $table->jsonb('horario_funcionamento')->nullable();
            $table->jsonb('redes_sociais')->nullable();
            $table->text('iban')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('club_settings');
    }
};
