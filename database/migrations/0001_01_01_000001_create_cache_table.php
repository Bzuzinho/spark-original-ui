<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public $withinTransaction = false;
    
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key');
            $table->mediumText('value');
            $table->integer('expiration');
        });
        DB::statement('ALTER TABLE cache ADD PRIMARY KEY (key)');

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key');
            $table->string('owner');
            $table->integer('expiration');
        });
        DB::statement('ALTER TABLE cache_locks ADD PRIMARY KEY (key)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cache');
        Schema::dropIfExists('cache_locks');
    }
};
