<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'stock_reservado')) {
                $table->integer('stock_reservado')->default(0)->after('stock');
            }

            if (!Schema::hasColumn('products', 'supplier_id')) {
                $table->uuid('supplier_id')->nullable()->after('stock_minimo');
                $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('set null');
                $table->index('supplier_id');
            }
        });

        Schema::table('suppliers', function (Blueprint $table) {
            if (!Schema::hasColumn('suppliers', 'notas')) {
                $table->text('notas')->nullable()->after('categoria');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'supplier_id')) {
                $table->dropForeign(['supplier_id']);
                $table->dropIndex(['supplier_id']);
                $table->dropColumn('supplier_id');
            }

            if (Schema::hasColumn('products', 'stock_reservado')) {
                $table->dropColumn('stock_reservado');
            }
        });

        Schema::table('suppliers', function (Blueprint $table) {
            if (Schema::hasColumn('suppliers', 'notas')) {
                $table->dropColumn('notas');
            }
        });
    }
};
