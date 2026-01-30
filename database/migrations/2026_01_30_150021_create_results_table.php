<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('prova_id');
            $table->uuid('user_id');
            $table->decimal('tempo_oficial', 10, 2);
            $table->integer('posicao')->nullable();
            $table->integer('pontos_fina')->nullable();
            $table->boolean('desclassificado')->default(false);
            $table->text('observacoes')->nullable();
            $table->timestamps();
            
            $table->foreign('prova_id')->references('id')->on('provas')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('prova_id');
            $table->index('user_id');
            $table->index('tempo_oficial');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('results');
    }
};
