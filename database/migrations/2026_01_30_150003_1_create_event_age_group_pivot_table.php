<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    /**
     * Tabela pivot para escalões elegíveis por evento
     * SUBSTITUI: events.escaloes_elegiveis (JSON)
     */
    public function up(): void
    {
        Schema::create('event_age_group', function (Blueprint $table) {
            $table->uuid('event_id');
            $table->uuid('age_group_id');
            
            $table->foreign('event_id')
                  ->references('id')
                  ->on('events')
                  ->onDelete('cascade');
                  
            $table->foreign('age_group_id')
                  ->references('id')
                  ->on('age_groups')
                  ->onDelete('cascade');
            
            $table->primary(['event_id', 'age_group_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_age_group');
    }
};
