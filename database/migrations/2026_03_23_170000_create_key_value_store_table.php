<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('key_value_store')) {
            return;
        }

        Schema::create('key_value_store', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key');
            $table->uuid('user_id')->nullable();
            $table->json('value')->nullable();
            $table->string('scope', 20)->default('global');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->unique(['key', 'user_id']);
            $table->index(['key', 'scope']);
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('key_value_store')) {
            return;
        }

        Schema::table('key_value_store', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropUnique(['key', 'user_id']);
            $table->dropIndex(['key', 'scope']);
        });

        Schema::dropIfExists('key_value_store');
    }
};
