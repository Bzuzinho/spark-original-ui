<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('membership_fees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->integer('month');
            $table->integer('year');
            $table->decimal('amount', 10, 2);
            $table->string('status', 30)->default('pending');
            $table->date('payment_date')->nullable();
            $table->foreignUuid('transaction_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
            
            $table->unique(['user_id', 'month', 'year']);
            $table->index('status');
            $table->index('month');
            $table->index('year');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_fees');
    }
};
