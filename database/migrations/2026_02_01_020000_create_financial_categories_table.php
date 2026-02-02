<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('financial_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('type', 30);
            $table->string('color')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            
            $table->index('type');
            $table->index('active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_categories');
    }
};
