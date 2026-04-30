<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'categoria_id')) {
                $table->uuid('categoria_id')->nullable()->after('categoria');
                $table->index(['categoria_id', 'ativo'], 'products_categoria_id_ativo_idx');
            }

            if (! Schema::hasColumn('products', 'preco_venda')) {
                $table->decimal('preco_venda', 10, 2)->nullable()->after('preco');
            }

            if (! Schema::hasColumn('products', 'ultimo_custo')) {
                $table->decimal('ultimo_custo', 10, 2)->nullable()->after('preco_venda');
            }

            if (! Schema::hasColumn('products', 'allow_sale')) {
                $table->boolean('allow_sale')->default(true)->after('visible_in_store');
            }

            if (! Schema::hasColumn('products', 'allow_request')) {
                $table->boolean('allow_request')->default(false)->after('allow_sale');
            }

            if (! Schema::hasColumn('products', 'allow_loan')) {
                $table->boolean('allow_loan')->default(false)->after('allow_request');
            }

            if (! Schema::hasColumn('products', 'track_stock')) {
                $table->boolean('track_stock')->default(true)->after('allow_loan');
            }

        });

        if (Schema::hasTable('item_categories') && Schema::hasColumn('products', 'categoria_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->foreign('categoria_id', 'products_categoria_id_foreign')
                    ->references('id')
                    ->on('item_categories')
                    ->nullOnDelete();
            });
        }

        if (Schema::hasColumn('products', 'preco_venda') && Schema::hasColumn('products', 'preco')) {
            DB::table('products')
                ->whereNull('preco_venda')
                ->update(['preco_venda' => DB::raw('preco')]);
        }
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'track_stock')) {
                $table->dropColumn('track_stock');
            }

            if (Schema::hasColumn('products', 'allow_loan')) {
                $table->dropColumn('allow_loan');
            }

            if (Schema::hasColumn('products', 'allow_request')) {
                $table->dropColumn('allow_request');
            }

            if (Schema::hasColumn('products', 'allow_sale')) {
                $table->dropColumn('allow_sale');
            }

            if (Schema::hasColumn('products', 'ultimo_custo')) {
                $table->dropColumn('ultimo_custo');
            }

            if (Schema::hasColumn('products', 'preco_venda')) {
                $table->dropColumn('preco_venda');
            }

            if (Schema::hasColumn('products', 'categoria_id')) {
                $table->dropForeign('products_categoria_id_foreign');
                $table->dropIndex('products_categoria_id_ativo_idx');
                $table->dropColumn('categoria_id');
            }
        });
    }
};