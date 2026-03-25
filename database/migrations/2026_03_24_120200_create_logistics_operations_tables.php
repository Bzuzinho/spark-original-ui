<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('article_id');
            $table->string('movement_type', 30);
            $table->integer('quantity');
            $table->decimal('unit_cost', 12, 2)->nullable();
            $table->string('reference_type', 40)->nullable();
            $table->uuid('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamps();

            $table->foreign('article_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['article_id', 'created_at']);
            $table->index('movement_type');
            $table->index(['reference_type', 'reference_id']);
        });

        Schema::create('equipment_loans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('borrower_user_id')->nullable();
            $table->string('borrower_name_snapshot');
            $table->uuid('article_id')->nullable();
            $table->string('article_name_snapshot');
            $table->integer('quantity');
            $table->date('loan_date');
            $table->date('due_date')->nullable();
            $table->date('return_date')->nullable();
            $table->string('status', 30)->default('active');
            $table->text('notes')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamps();

            $table->foreign('borrower_user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('article_id')->references('id')->on('products')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');

            $table->index('status');
            $table->index('loan_date');
            $table->index('due_date');
        });

        Schema::create('supplier_purchases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('supplier_id')->nullable();
            $table->string('supplier_name_snapshot');
            $table->string('invoice_reference');
            $table->date('invoice_date');
            $table->decimal('total_amount', 12, 2);
            $table->uuid('financial_movement_id')->nullable();
            $table->uuid('financial_entry_id')->nullable();
            $table->text('notes')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamps();

            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('set null');
            $table->foreign('financial_movement_id')->references('id')->on('movements')->onDelete('set null');
            $table->foreign('financial_entry_id')->references('id')->on('financial_entries')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');

            $table->index('invoice_date');
            $table->index('supplier_id');
        });

        Schema::create('supplier_purchase_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('supplier_purchase_id');
            $table->uuid('article_id')->nullable();
            $table->string('article_name_snapshot');
            $table->integer('quantity');
            $table->decimal('unit_cost', 12, 2);
            $table->decimal('line_total', 12, 2);
            $table->timestamps();

            $table->foreign('supplier_purchase_id')->references('id')->on('supplier_purchases')->onDelete('cascade');
            $table->foreign('article_id')->references('id')->on('products')->onDelete('set null');

            $table->index('supplier_purchase_id');
            $table->index('article_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_purchase_items');
        Schema::dropIfExists('supplier_purchases');
        Schema::dropIfExists('equipment_loans');
        Schema::dropIfExists('stock_movements');
    }
};
