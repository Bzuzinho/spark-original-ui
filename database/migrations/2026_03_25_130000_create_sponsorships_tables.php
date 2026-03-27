<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('sponsorships', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('codigo')->unique();
            $table->string('sponsor_name');
            $table->uuid('supplier_id')->nullable();
            $table->enum('type', ['money', 'goods', 'mixed']);
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('periodicity', ['pontual', 'mensal', 'trimestral', 'anual']);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->uuid('cost_center_id')->nullable();
            $table->enum('status', ['ativo', 'pendente', 'fechado', 'cancelado'])->default('pendente');
            $table->text('notes')->nullable();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('supplier_id')->references('id')->on('suppliers')->nullOnDelete();
            $table->foreign('cost_center_id')->references('id')->on('cost_centers')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();

            $table->index(['type', 'status']);
            $table->index('start_date');
            $table->index('cost_center_id');
        });

        Schema::create('sponsorship_money_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('sponsorship_id');
            $table->string('description');
            $table->decimal('amount', 12, 2);
            $table->date('expected_date')->nullable();
            $table->uuid('financial_movement_id')->nullable();
            $table->enum('integration_status', ['pending', 'generated', 'failed'])->default('pending');
            $table->text('integration_message')->nullable();
            $table->timestamps();

            $table->foreign('sponsorship_id')->references('id')->on('sponsorships')->cascadeOnDelete();
            $table->foreign('financial_movement_id')->references('id')->on('movements')->nullOnDelete();

            $table->index(['sponsorship_id', 'integration_status']);
            $table->index('expected_date');
        });

        Schema::create('sponsorship_goods_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('sponsorship_id');
            $table->string('item_name');
            $table->uuid('item_id')->nullable();
            $table->string('category')->nullable();
            $table->decimal('quantity', 12, 2);
            $table->decimal('unit_value', 12, 2)->nullable();
            $table->decimal('total_value', 12, 2)->nullable();
            $table->uuid('stock_entry_id')->nullable();
            $table->enum('integration_status', ['pending', 'generated', 'failed'])->default('pending');
            $table->text('integration_message')->nullable();
            $table->timestamps();

            $table->foreign('sponsorship_id')->references('id')->on('sponsorships')->cascadeOnDelete();
            $table->foreign('item_id')->references('id')->on('products')->nullOnDelete();
            $table->foreign('stock_entry_id')->references('id')->on('stock_movements')->nullOnDelete();

            $table->index(['sponsorship_id', 'integration_status']);
            $table->index('item_id');
        });

        Schema::create('sponsorship_integrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('sponsorship_id');
            $table->enum('integration_type', ['financial', 'stock']);
            $table->enum('source_type', ['money_item', 'goods_item', 'mixed']);
            $table->uuid('source_id')->nullable();
            $table->string('target_module');
            $table->string('target_table')->nullable();
            $table->uuid('target_record_id')->nullable();
            $table->enum('status', ['pending', 'generated', 'failed'])->default('pending');
            $table->text('message')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->timestamps();

            $table->foreign('sponsorship_id')->references('id')->on('sponsorships')->cascadeOnDelete();

            $table->index(['sponsorship_id', 'status']);
            $table->index(['integration_type', 'status']);
            $table->index(['source_type', 'source_id']);
            $table->index('executed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsorship_integrations');
        Schema::dropIfExists('sponsorship_goods_items');
        Schema::dropIfExists('sponsorship_money_items');
        Schema::dropIfExists('sponsorships');
    }
};