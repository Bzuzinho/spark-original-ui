<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_type_landing_pages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_type_id')->constrained('user_types')->cascadeOnDelete();
            $table->string('landing_module_key', 100);
            $table->string('base_page_key', 150);
            $table->timestamps();

            $table->unique('user_type_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_type_landing_pages');
    }
};