<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            if (!Schema::hasColumn('invoices', 'oculta')) {
                $table->boolean('oculta')->default(false)->after('valor_total');
            }
            if (!Schema::hasColumn('invoices', 'origem_tipo')) {
                $table->string('origem_tipo', 30)->nullable()->after('tipo');
            }
            if (!Schema::hasColumn('invoices', 'origem_id')) {
                $table->uuid('origem_id')->nullable()->after('origem_tipo');
            }
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            if (Schema::hasColumn('invoices', 'oculta')) {
                $table->dropColumn('oculta');
            }
            if (Schema::hasColumn('invoices', 'origem_tipo')) {
                $table->dropColumn('origem_tipo');
            }
            if (Schema::hasColumn('invoices', 'origem_id')) {
                $table->dropColumn('origem_id');
            }
        });
    }
};
