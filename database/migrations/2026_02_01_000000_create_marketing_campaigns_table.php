<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false; // ← ADD THIS for PostgreSQL ENUM support
    
    public function up(): void
    {
        Schema::create('marketing_campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');                              // ← CHANGED
            $table->text('description')->nullable();              // ← CHANGED
            $table->string('type', 50);                          // ← CHANGED to string for flexibility
            $table->date('start_date');                          // ← CHANGED
            $table->date('end_date')->nullable();                // ← CHANGED
            $table->string('status', 30)->default('planned');    // ← CHANGED
            $table->decimal('budget', 10, 2)->nullable();        // ← CHANGED
            $table->integer('estimated_reach')->nullable();       // ← CHANGED
            $table->text('notes')->nullable();                   // ← CHANGED
            $table->timestamps();
            
            $table->index('status');  // ← CHANGED
            $table->index('type');    // ← CHANGED
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketing_campaigns');
    }
};