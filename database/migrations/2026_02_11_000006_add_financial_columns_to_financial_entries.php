<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('financial_entries', function (Blueprint $table) {
            if (!Schema::hasColumn('financial_entries', 'documento_ref')) {
                $table->string('documento_ref')->nullable()->after('descricao');
            }
            if (!Schema::hasColumn('financial_entries', 'origem_tipo')) {
                $table->string('origem_tipo', 30)->nullable()->after('fatura_id');
            }
            if (!Schema::hasColumn('financial_entries', 'origem_id')) {
                $table->uuid('origem_id')->nullable()->after('origem_tipo');
            }
        });

        Schema::table('financial_entries', function (Blueprint $table) {
            if (Schema::hasColumn('financial_entries', 'fatura_id')) {
                try {
                    $table->foreign('fatura_id')->references('id')->on('invoices')->onDelete('set null');
                } catch (Throwable $e) {
                    // Ignore if constraint already exists.
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('financial_entries', function (Blueprint $table) {
            if (Schema::hasColumn('financial_entries', 'origem_id')) {
                $table->dropColumn('origem_id');
            }
            if (Schema::hasColumn('financial_entries', 'origem_tipo')) {
                $table->dropColumn('origem_tipo');
            }
            if (Schema::hasColumn('financial_entries', 'documento_ref')) {
                $table->dropColumn('documento_ref');
            }
        });
    }
};
