<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('result_splits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('resultado_id');
            $table->integer('distancia_parcial_m');
            $table->decimal('tempo_parcial', 10, 2);
            $table->timestamps();
            
            $table->foreign('resultado_id')->references('id')->on('results')->onDelete('cascade');
            
            $table->index('resultado_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('result_splits');
    }
};
