<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nome');
            $table->string('escalao')->nullable();
            $table->foreignUuid('treinador_id')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('ano_fundacao')->nullable();
            $table->boolean('ativa')->default(true);
            $table->timestamps();
            
            $table->index('ativa');
            $table->index('escalao');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
