<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignUuid('category_id')->nullable()->constrained('financial_categories')->onDelete('set null');
            $table->string('description');
            $table->decimal('amount', 10, 2);
            $table->string('type', 30);
            $table->date('date');
            $table->string('payment_method', 30)->nullable();
            $table->string('receipt')->nullable();
            $table->string('status', 30)->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('date');
            $table->index('status');
            $table->index('type');
            $table->index('user_id');
            $table->index('category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
