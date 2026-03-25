<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('logistics_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('requester_user_id')->nullable();
            $table->string('requester_name_snapshot');
            $table->string('requester_area')->nullable();
            $table->string('requester_type', 30)->nullable();
            $table->string('status', 30)->default('draft');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->uuid('financial_invoice_id')->nullable();
            $table->text('notes')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamps();

            $table->foreign('requester_user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('financial_invoice_id')->references('id')->on('invoices')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');

            $table->index('status');
            $table->index('requester_user_id');
            $table->index('created_at');
        });

        Schema::create('logistics_request_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('logistics_request_id');
            $table->uuid('article_id')->nullable();
            $table->string('article_name_snapshot');
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('line_total', 12, 2);
            $table->timestamps();

            $table->foreign('logistics_request_id', 'lri_request_fk')->references('id')->on('logistics_requests')->onDelete('cascade');
            $table->foreign('article_id')->references('id')->on('products')->onDelete('set null');

            $table->index('logistics_request_id', 'lri_request_idx');
            $table->index('article_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logistics_request_items');
        Schema::dropIfExists('logistics_requests');
    }
};
