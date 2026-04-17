<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permission_nodes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key')->unique();
            $table->string('label');
            $table->uuid('parent_id')->nullable();
            $table->string('module_key', 100);
            $table->string('node_type', 50);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['module_key', 'active']);
            $table->index(['parent_id', 'sort_order']);
        });

        Schema::table('permission_nodes', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('permission_nodes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permission_nodes');
    }
};