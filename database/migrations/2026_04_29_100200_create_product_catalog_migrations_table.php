<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('product_catalog_migrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('legacy_source', 80);
            $table->uuid('legacy_id');
            $table->uuid('product_id')->nullable();
            $table->uuid('product_variant_id')->nullable();
            $table->timestamp('migrated_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['legacy_source', 'legacy_id'], 'product_catalog_migrations_legacy_unique');
            $table->index(['product_id', 'product_variant_id'], 'product_catalog_migrations_product_idx');
            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
            $table->foreign('product_variant_id')->references('id')->on('product_variants')->nullOnDelete();
        });

        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'legacy_loja_produto_id')) {
                $table->dropForeign('products_legacy_loja_produto_id_foreign');
                $table->dropUnique('products_legacy_loja_produto_id_unique');
                $table->dropColumn('legacy_loja_produto_id');
            }
        });

        Schema::table('product_variants', function (Blueprint $table) {
            if (Schema::hasColumn('product_variants', 'legacy_loja_produto_variante_id')) {
                $table->dropForeign('product_variants_legacy_loja_produto_variante_id_foreign');
                $table->dropUnique(['legacy_loja_produto_variante_id']);
                $table->dropColumn('legacy_loja_produto_variante_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            if (! Schema::hasColumn('product_variants', 'legacy_loja_produto_variante_id')) {
                $table->uuid('legacy_loja_produto_variante_id')->nullable()->unique();
            }
        });

        if (Schema::hasTable('loja_produto_variantes')) {
            Schema::table('product_variants', function (Blueprint $table) {
                if (Schema::hasColumn('product_variants', 'legacy_loja_produto_variante_id')) {
                    $table->foreign('legacy_loja_produto_variante_id', 'product_variants_legacy_loja_produto_variante_id_foreign')
                        ->references('id')
                        ->on('loja_produto_variantes')
                        ->nullOnDelete();
                }
            });
        }

        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'legacy_loja_produto_id')) {
                $table->uuid('legacy_loja_produto_id')->nullable()->after('variant_options');
                $table->unique('legacy_loja_produto_id', 'products_legacy_loja_produto_id_unique');
            }
        });

        if (Schema::hasTable('loja_produtos')) {
            Schema::table('products', function (Blueprint $table) {
                if (Schema::hasColumn('products', 'legacy_loja_produto_id')) {
                    $table->foreign('legacy_loja_produto_id', 'products_legacy_loja_produto_id_foreign')
                        ->references('id')
                        ->on('loja_produtos')
                        ->nullOnDelete();
                }
            });
        }

        Schema::dropIfExists('product_catalog_migrations');
    }
};