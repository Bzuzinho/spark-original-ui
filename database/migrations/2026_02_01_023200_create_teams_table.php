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
            $table->string('name');
            $table->string('age_group')->nullable();
            $table->foreignUuid('coach_id')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('founding_year')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            
            $table->index('active');
            $table->index('age_group');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
