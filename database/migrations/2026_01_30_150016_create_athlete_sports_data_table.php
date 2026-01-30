<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('athlete_sports_data', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('num_federacao')->nullable();
            $table->string('cartao_federacao')->nullable();
            $table->string('numero_pmb')->nullable();
            $table->date('data_inscricao')->nullable();
            $table->string('inscricao_path')->nullable();
            $table->uuid('escalao_id')->nullable();
            $table->date('data_atestado_medico')->nullable();
            $table->json('arquivo_atestado_medico')->nullable();
            $table->text('informacoes_medicas')->nullable();
            $table->boolean('ativo')->default(true);
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('user_id');
            $table->index('num_federacao');
            $table->index('ativo');
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('athlete_sports_data');
    }
};
