<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('monthly_fees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('designacao');
            $table->decimal('valor', 10, 2);
            $table->boolean('ativo')->default(true);
            $table->timestamps();
            
            $table->index('ativo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_fees');
    }
};
