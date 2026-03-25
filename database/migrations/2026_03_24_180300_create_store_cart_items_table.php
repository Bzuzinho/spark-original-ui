<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('store_cart_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('target_user_id')->nullable();
            $table->uuid('article_id');
            $table->string('variant')->nullable();
            $table->integer('quantity')->default(1);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('target_user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('article_id')->references('id')->on('products')->onDelete('cascade');

            $table->index('user_id');
            $table->index('target_user_id');
            $table->index('article_id');
            $table->unique(['user_id', 'target_user_id', 'article_id', 'variant'], 'store_cart_unique_item');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_cart_items');
    }
};
