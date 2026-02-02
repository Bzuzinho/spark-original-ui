<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('training_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('team_id')->nullable()->constrained()->onDelete('set null');
            $table->dateTime('datetime');
            $table->integer('duration_minutes')->default(60);
            $table->string('location')->nullable();
            $table->text('objectives')->nullable();
            $table->string('status', 30)->default('scheduled');
            $table->timestamps();
            
            $table->index('datetime');
            $table->index('team_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_sessions');
    }
};
