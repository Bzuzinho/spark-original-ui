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
            $table->boolean('oculta')->default(false)->after('valor_total');
            $table->string('origem_tipo', 30)->nullable()->after('tipo');
            $table->uuid('origem_id')->nullable()->after('origem_tipo');
        });

        Schema::table('movements', function (Blueprint $table) {
            $table->string('origem_tipo', 30)->nullable()->after('tipo');
            $table->uuid('origem_id')->nullable()->after('origem_tipo');
        });

        Schema::table('financial_entries', function (Blueprint $table) {
            $table->string('origem_tipo', 30)->nullable()->after('fatura_id');
            $table->uuid('origem_id')->nullable()->after('origem_tipo');
        });
    }

    public function down(): void
    {
        Schema::table('financial_entries', function (Blueprint $table) {
            $table->dropColumn(['origem_tipo', 'origem_id']);
        });

        Schema::table('movements', function (Blueprint $table) {
            $table->dropColumn(['origem_tipo', 'origem_id']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['oculta', 'origem_tipo', 'origem_id']);
        });
    }
};
