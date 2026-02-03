<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('key_value_store', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key')->index(); // ex: 'club-users', 'club-events'
            $table->foreignUuid('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->json('value'); // Valor serializado
            $table->string('scope')->default('global')->index(); // 'global' ou 'user'
            $table->timestamps();
            
            // Key única por (key + user_id) ou (key global)
            $table->unique(['key', 'user_id']);
            $table->index(['key', 'scope']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('key_value_store');
    }
};
