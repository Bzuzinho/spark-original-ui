<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('convocation_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('convocatoria_grupo_id');
            $table->uuid('evento_id');
            $table->string('evento_nome');
            $table->string('tipo')->default('convocatoria');
            $table->date('data_emissao');
            $table->decimal('valor', 10, 2);
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('convocatoria_grupo_id')->references('id')->on('convocation_groups')->onDelete('cascade');
            $table->foreign('evento_id')->references('id')->on('events')->onDelete('cascade');
            
            $table->index('user_id');
            $table->index('convocatoria_grupo_id');
            $table->index('evento_id');
            $table->index('data_emissao');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('convocation_movements');
    }
};
