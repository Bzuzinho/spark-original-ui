<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('call_ups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('event_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('team_id')->constrained()->onDelete('cascade');
            $table->json('atletas_convocados');
            $table->json('presencas')->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();
            
            $table->index('event_id');
            $table->index('team_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('call_ups');
    }
};
