<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('store_order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('store_order_id');
            $table->uuid('article_id')->nullable();
            $table->string('article_code_snapshot');
            $table->string('article_name_snapshot');
            $table->string('variant_snapshot')->nullable();
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('line_total', 12, 2);
            $table->timestamps();

            $table->foreign('store_order_id')->references('id')->on('store_orders')->onDelete('cascade');
            $table->foreign('article_id')->references('id')->on('products')->onDelete('set null');

            $table->index('store_order_id');
            $table->index('article_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_order_items');
    }
};
