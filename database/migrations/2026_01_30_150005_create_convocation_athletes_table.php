<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('convocation_athletes', function (Blueprint $table) {
            $table->uuid('convocatoria_grupo_id');
            $table->uuid('atleta_id');
            $table->json('provas');
            $table->boolean('presente')->default(false);
            $table->boolean('confirmado')->default(false);
            $table->timestamps();
            
            $table->primary(['convocatoria_grupo_id', 'atleta_id'], 'convocation_athletes_pk');
            
            $table->foreign('convocatoria_grupo_id')->references('id')->on('convocation_groups')->onDelete('cascade');
            $table->foreign('atleta_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('atleta_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('convocation_athletes');
    }
};
