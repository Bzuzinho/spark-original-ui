<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('microcycles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mesociclo_id');
            $table->string('semana');
            $table->integer('volume_previsto')->nullable();
            $table->text('notas')->nullable();
            $table->timestamps();
            
            $table->foreign('mesociclo_id')->references('id')->on('mesocycles')->onDelete('cascade');
            
            $table->index('mesociclo_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('microcycles');
    }
};
