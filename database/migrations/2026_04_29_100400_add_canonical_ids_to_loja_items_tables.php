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
        Schema::table('loja_carrinho_itens', function (Blueprint $table) {
            if (! Schema::hasColumn('loja_carrinho_itens', 'article_id')) {
                $table->uuid('article_id')->nullable()->after('loja_carrinho_id');
                $table->foreign('article_id')->references('id')->on('products')->nullOnDelete();
                $table->index('article_id');
            }

            if (! Schema::hasColumn('loja_carrinho_itens', 'product_variant_id')) {
                $table->uuid('product_variant_id')->nullable()->after('loja_produto_variante_id');
                $table->foreign('product_variant_id')->references('id')->on('product_variants')->nullOnDelete();
                $table->index('product_variant_id');
            }
        });

        Schema::table('loja_encomenda_itens', function (Blueprint $table) {
            if (! Schema::hasColumn('loja_encomenda_itens', 'article_id')) {
                $table->uuid('article_id')->nullable()->after('loja_encomenda_id');
                $table->foreign('article_id')->references('id')->on('products')->nullOnDelete();
                $table->index('article_id');
            }

            if (! Schema::hasColumn('loja_encomenda_itens', 'product_variant_id')) {
                $table->uuid('product_variant_id')->nullable()->after('loja_produto_variante_id');
                $table->foreign('product_variant_id')->references('id')->on('product_variants')->nullOnDelete();
                $table->index('product_variant_id');
            }
        });

        Schema::table('loja_carrinho_itens', function (Blueprint $table) {
            $table->uuid('loja_produto_id')->nullable()->change();
            $table->uuid('loja_produto_variante_id')->nullable()->change();
        });

        Schema::table('loja_encomenda_itens', function (Blueprint $table) {
            $table->uuid('loja_produto_id')->nullable()->change();
            $table->uuid('loja_produto_variante_id')->nullable()->change();
        });

        $this->backfillCanonicalIds('loja_carrinho_itens');
        $this->backfillCanonicalIds('loja_encomenda_itens');
    }

    public function down(): void
    {
        $this->backfillLegacyIds('loja_carrinho_itens');
        $this->backfillLegacyIds('loja_encomenda_itens');

        Schema::table('loja_carrinho_itens', function (Blueprint $table) {
            $table->uuid('loja_produto_id')->nullable(false)->change();
            $table->uuid('loja_produto_variante_id')->nullable()->change();
            $table->dropForeign(['article_id']);
            $table->dropForeign(['product_variant_id']);
            $table->dropIndex(['article_id']);
            $table->dropIndex(['product_variant_id']);
            $table->dropColumn(['article_id', 'product_variant_id']);
        });

        Schema::table('loja_encomenda_itens', function (Blueprint $table) {
            $table->uuid('loja_produto_id')->nullable(false)->change();
            $table->uuid('loja_produto_variante_id')->nullable()->change();
            $table->dropForeign(['article_id']);
            $table->dropForeign(['product_variant_id']);
            $table->dropIndex(['article_id']);
            $table->dropIndex(['product_variant_id']);
            $table->dropColumn(['article_id', 'product_variant_id']);
        });
    }

    private function backfillCanonicalIds(string $table): void
    {
        DB::table($table)
            ->orderBy('created_at')
            ->get()
            ->each(function ($item) use ($table) {
                $articleId = null;
                $productVariantId = null;

                if ($item->loja_produto_id) {
                    $articleId = DB::table('product_catalog_migrations')
                        ->where('legacy_source', 'loja_produtos')
                        ->where('legacy_id', $item->loja_produto_id)
                        ->value('product_id');
                }

                if ($item->loja_produto_variante_id) {
                    $productVariantId = DB::table('product_catalog_migrations')
                        ->where('legacy_source', 'loja_produto_variantes')
                        ->where('legacy_id', $item->loja_produto_variante_id)
                        ->value('product_variant_id');
                }

                DB::table($table)
                    ->where('id', $item->id)
                    ->update([
                        'article_id' => $articleId,
                        'product_variant_id' => $productVariantId,
                    ]);
            });
    }

    private function backfillLegacyIds(string $table): void
    {
        DB::table($table)
            ->orderBy('created_at')
            ->get()
            ->each(function ($item) use ($table) {
                $legacyProductId = $item->loja_produto_id;
                $legacyVariantId = $item->loja_produto_variante_id;

                if (! $legacyProductId && $item->article_id) {
                    $legacyProductId = DB::table('product_catalog_migrations')
                        ->where('legacy_source', 'loja_produtos')
                        ->where('product_id', $item->article_id)
                        ->value('legacy_id');
                }

                if (! $legacyVariantId && $item->product_variant_id) {
                    $legacyVariantId = DB::table('product_catalog_migrations')
                        ->where('legacy_source', 'loja_produto_variantes')
                        ->where('product_variant_id', $item->product_variant_id)
                        ->value('legacy_id');
                }

                DB::table($table)
                    ->where('id', $item->id)
                    ->update([
                        'loja_produto_id' => $legacyProductId,
                        'loja_produto_variante_id' => $legacyVariantId,
                    ]);
            });
    }
};