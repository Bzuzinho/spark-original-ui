<?php

namespace Tests\Feature\Catalog;

use App\Models\ItemCategory;
use App\Models\LojaProduto;
use App\Models\LojaProdutoVariante;
use App\Models\Product;
use App\Models\ProductCatalogMigration;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class CatalogResetBackfillFixturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_command_removes_seeded_legacy_canonical_artifacts_and_reports(): void
    {
        $category = ItemCategory::create([
            'codigo' => 'LOJA-RESET',
            'nome' => 'Reset Fixtures',
            'contexto' => 'loja',
            'ativo' => true,
        ]);

        $legacyProduct = LojaProduto::create([
            'categoria_id' => $category->id,
            'codigo' => 'LEG-SEED-RESET-001',
            'nome' => 'Reset Produto',
            'slug' => 'reset-produto',
            'descricao' => 'Fixture de reset',
            'preco' => 19.90,
            'imagem_principal_path' => null,
            'ativo' => true,
            'destaque' => false,
            'gere_stock' => true,
            'stock_atual' => 6,
            'stock_minimo' => 1,
            'ordem' => 1,
        ]);

        $legacyVariant = LojaProdutoVariante::create([
            'loja_produto_id' => $legacyProduct->id,
            'nome' => 'Base',
            'tamanho' => 'M',
            'cor' => 'Azul',
            'sku' => 'LEG-SEED-RESET-001-M-AZ',
            'preco_extra' => 0,
            'stock_atual' => 2,
            'ativo' => true,
        ]);

        $product = Product::create([
            'codigo' => 'LEG-SEED-RESET-001',
            'nome' => 'Reset Produto',
            'descricao' => 'Canonico',
            'categoria' => 'Merchandising',
            'preco' => 19.90,
            'preco_venda' => 19.90,
            'stock' => 6,
            'stock_reservado' => 0,
            'stock_minimo' => 1,
            'ativo' => true,
            'visible_in_store' => true,
            'allow_sale' => true,
            'allow_request' => false,
            'allow_loan' => false,
            'track_stock' => true,
        ]);

        $productVariant = ProductVariant::create([
            'product_id' => $product->id,
            'nome' => 'Base',
            'sku' => 'LEG-SEED-RESET-001-M-AZ-CAN',
            'tamanho' => 'M',
            'cor' => 'Azul',
            'atributos_json' => null,
            'preco_extra' => 0,
            'stock' => 2,
            'stock_reservado' => 0,
            'ativo' => true,
        ]);

        ProductCatalogMigration::create([
            'legacy_source' => 'loja_produtos',
            'legacy_id' => $legacyProduct->id,
            'product_id' => $product->id,
            'product_variant_id' => null,
            'migrated_at' => now(),
            'notes' => 'create',
        ]);

        ProductCatalogMigration::create([
            'legacy_source' => 'loja_produto_variantes',
            'legacy_id' => $legacyVariant->id,
            'product_id' => $product->id,
            'product_variant_id' => $productVariant->id,
            'migrated_at' => now(),
            'notes' => 'create',
        ]);

        $reportPath = storage_path('app/testing/manual-catalog-backfill-report.json');
        File::ensureDirectoryExists(dirname($reportPath));
        File::put($reportPath, '{"ok":true}');

        Artisan::call('catalog:reset-backfill-fixtures', [
            '--force' => true,
        ]);

        $this->assertDatabaseMissing('loja_produtos', ['id' => $legacyProduct->id]);
        $this->assertDatabaseMissing('loja_produto_variantes', ['id' => $legacyVariant->id]);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
        $this->assertDatabaseMissing('product_variants', ['id' => $productVariant->id]);
        $this->assertDatabaseCount('product_catalog_migrations', 0);
        $this->assertFalse(File::exists($reportPath));
    }
}