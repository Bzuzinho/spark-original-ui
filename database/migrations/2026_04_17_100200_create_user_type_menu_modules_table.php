<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_type_menu_modules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_type_id')->constrained('user_types')->cascadeOnDelete();
            $table->string('module_key', 100);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['user_type_id', 'module_key']);
            $table->index(['user_type_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_type_menu_modules');
    }
};