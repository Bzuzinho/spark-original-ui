<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('convocation_movement_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('movimento_convocatoria_id');
            $table->string('descricao');
            $table->decimal('valor', 10, 2);
            $table->timestamps();
            
            $table->foreign('movimento_convocatoria_id', 'conv_mov_items_mov_id_foreign')->references('id')->on('convocation_movements')->onDelete('cascade');
            
            $table->index('movimento_convocatoria_id', 'conv_mov_items_mov_id_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('convocation_movement_items');
    }
};
