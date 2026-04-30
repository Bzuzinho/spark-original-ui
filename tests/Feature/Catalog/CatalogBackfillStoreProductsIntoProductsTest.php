<?php

namespace Tests\Feature\Catalog;

use App\Models\ItemCategory;
use App\Models\LojaProduto;
use App\Models\LojaProdutoVariante;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class CatalogBackfillStoreProductsIntoProductsTest extends TestCase
{
    use RefreshDatabase;

    public function test_dry_run_does_not_persist_products_variants_or_mappings(): void
    {
        $legacyProduct = $this->createLegacyProduct('LEG-001', 'T-Shirt Clube', 20.00);
        $this->createLegacyVariant($legacyProduct->id, 'M', 'TSHIRT-M', 2.00);

        Artisan::call('catalog:backfill-store-products-into-products', [
            '--dry-run' => true,
        ]);

        $this->assertSame(0, Product::query()->where('codigo', 'LEG-001')->count());
        $this->assertDatabaseCount('product_variants', 0);
        $this->assertDatabaseCount('product_catalog_migrations', 0);
    }

    public function test_backfill_creates_canonical_product_variant_and_mapping_records(): void
    {
        $legacyProduct = $this->createLegacyProduct('LEG-002', 'Calcoes Clube', 15.50);
        $legacyVariant = $this->createLegacyVariant($legacyProduct->id, 'Azul', 'SHORT-AZ', 1.50);

        Artisan::call('catalog:backfill-store-products-into-products');

        $product = Product::query()->where('codigo', 'LEG-002')->firstOrFail();

        $this->assertSame('Calcoes Clube', $product->nome);
        $this->assertSame('15.50', (string) $product->preco_venda);
        $this->assertTrue((bool) $product->allow_sale);
        $this->assertTrue((bool) $product->track_stock);

        $this->assertDatabaseHas('product_variants', [
            'product_id' => $product->id,
            'sku' => 'SHORT-AZ',
            'cor' => 'Azul',
        ]);

        $this->assertDatabaseHas('product_catalog_migrations', [
            'legacy_source' => 'loja_produtos',
            'legacy_id' => $legacyProduct->id,
            'product_id' => $product->id,
            'notes' => 'create',
        ]);

        $this->assertDatabaseHas('product_catalog_migrations', [
            'legacy_source' => 'loja_produto_variantes',
            'legacy_id' => $legacyVariant->id,
            'product_id' => $product->id,
            'notes' => 'create',
        ]);
    }

    public function test_backfill_matches_existing_safe_product_by_code_and_writes_mapping(): void
    {
        $legacyProduct = $this->createLegacyProduct('LEG-003', 'Touca Clube', 8.00);

        $existingProduct = Product::create([
            'codigo' => 'LEG-003',
            'nome' => 'Touca Clube',
            'descricao' => 'Touca oficial',
            'categoria' => 'Merchandising',
            'preco' => 8.00,
            'preco_venda' => 8.00,
            'stock' => 5,
            'stock_reservado' => 0,
            'stock_minimo' => 1,
            'ativo' => true,
            'visible_in_store' => true,
            'allow_sale' => true,
            'allow_request' => false,
            'allow_loan' => false,
            'track_stock' => true,
        ]);

        Artisan::call('catalog:backfill-store-products-into-products');

        $this->assertSame(1, Product::query()->where('codigo', 'LEG-003')->count());
        $this->assertDatabaseHas('product_catalog_migrations', [
            'legacy_source' => 'loja_produtos',
            'legacy_id' => $legacyProduct->id,
            'product_id' => $existingProduct->id,
            'notes' => 'match',
        ]);
    }

    public function test_backfill_reports_conflict_for_divergent_existing_product_and_writes_json_report(): void
    {
        $legacyProduct = $this->createLegacyProduct('LEG-004', 'Casaco Clube', 30.00);

        Product::create([
            'codigo' => 'LEG-004',
            'nome' => 'Produto Diferente',
            'descricao' => 'Nao compatível',
            'categoria' => 'Merchandising',
            'preco' => 10.00,
            'preco_venda' => 10.00,
            'stock' => 3,
            'stock_reservado' => 0,
            'stock_minimo' => 1,
            'ativo' => true,
            'visible_in_store' => true,
            'allow_sale' => true,
            'allow_request' => false,
            'allow_loan' => false,
            'track_stock' => true,
        ]);

        $reportPath = storage_path('app/testing/catalog-backfill-report.json');
        File::delete($reportPath);

        Artisan::call('catalog:backfill-store-products-into-products', [
            '--report' => $reportPath,
        ]);

        $this->assertDatabaseMissing('product_catalog_migrations', [
            'legacy_source' => 'loja_produtos',
            'legacy_id' => $legacyProduct->id,
        ]);

        $this->assertTrue(File::exists($reportPath));

        $report = json_decode((string) File::get($reportPath), true, 512, JSON_THROW_ON_ERROR);

        $this->assertSame(1, $report['stats']['product_conflicts']);
        $this->assertCount(1, $report['conflicts']);
        $this->assertSame('product', $report['conflicts'][0]['type']);
        $this->assertSame($legacyProduct->id, $report['conflicts'][0]['legacy_id']);
    }

    public function test_backfill_reports_conflict_for_duplicate_variant_sku_in_another_canonical_product(): void
    {
        $legacyProduct = $this->createLegacyProduct('LEG-005', 'Polo Clube', 27.00);
        $legacyVariant = $this->createLegacyVariant($legacyProduct->id, 'Branco', 'POLO-BR-SHARED', 0.00);

        $otherProduct = Product::create([
            'codigo' => 'CAN-OTHER-001',
            'nome' => 'Outro Produto',
            'descricao' => 'Produto canonico existente',
            'categoria' => 'Merchandising',
            'preco' => 12.00,
            'preco_venda' => 12.00,
            'stock' => 2,
            'stock_reservado' => 0,
            'stock_minimo' => 0,
            'ativo' => true,
            'visible_in_store' => false,
            'allow_sale' => true,
            'allow_request' => false,
            'allow_loan' => false,
            'track_stock' => true,
        ]);

        $existingVariant = $otherProduct->variants()->create([
            'nome' => 'Base',
            'sku' => 'POLO-BR-SHARED',
            'tamanho' => 'M',
            'cor' => 'Branco',
            'atributos_json' => null,
            'preco_extra' => 0,
            'stock' => 1,
            'stock_reservado' => 0,
            'ativo' => true,
        ]);

        $reportPath = storage_path('app/testing/catalog-backfill-variant-conflict-report.json');
        File::delete($reportPath);

        Artisan::call('catalog:backfill-store-products-into-products', [
            '--report' => $reportPath,
        ]);

        $this->assertDatabaseHas('product_catalog_migrations', [
            'legacy_source' => 'loja_produtos',
            'legacy_id' => $legacyProduct->id,
        ]);

        $this->assertDatabaseMissing('product_catalog_migrations', [
            'legacy_source' => 'loja_produto_variantes',
            'legacy_id' => $legacyVariant->id,
        ]);

        $this->assertTrue(File::exists($reportPath));

        $report = json_decode((string) File::get($reportPath), true, 512, JSON_THROW_ON_ERROR);

        $this->assertSame(1, $report['stats']['variant_conflicts']);
        $this->assertCount(1, array_values(array_filter($report['conflicts'], fn (array $conflict) => $conflict['type'] === 'variant')));
        $this->assertDatabaseHas('product_variants', [
            'id' => $existingVariant->id,
            'product_id' => $otherProduct->id,
            'sku' => 'POLO-BR-SHARED',
        ]);
    }

    public function test_backfill_is_idempotent_when_reexecuted_after_successful_import(): void
    {
        $legacyProduct = $this->createLegacyProduct('LEG-006', 'Fato de Treino', 49.90);
        $this->createLegacyVariant($legacyProduct->id, 'Azul', 'FATO-AZ-M', 0.00);

        Artisan::call('catalog:backfill-store-products-into-products');
        Artisan::call('catalog:backfill-store-products-into-products');

        $this->assertSame(1, Product::query()->where('codigo', 'LEG-006')->count());
        $this->assertSame(1, Product::query()->where('codigo', 'LEG-006')->firstOrFail()->variants()->where('sku', 'FATO-AZ-M')->count());
        $this->assertSame(1, \App\Models\ProductCatalogMigration::query()->where('legacy_source', 'loja_produtos')->where('legacy_id', $legacyProduct->id)->count());
        $this->assertSame(2, \App\Models\ProductCatalogMigration::query()->count());
    }

    private function createLegacyProduct(string $codigo, string $nome, float $preco): LojaProduto
    {
        $category = ItemCategory::create([
            'codigo' => 'CAT-' . $codigo,
            'nome' => 'Merchandising',
            'ativo' => true,
        ]);

        return LojaProduto::create([
            'categoria_id' => $category->id,
            'codigo' => $codigo,
            'nome' => $nome,
            'slug' => strtolower($codigo),
            'descricao' => $nome . ' oficial',
            'preco' => $preco,
            'imagem_principal_path' => null,
            'ativo' => true,
            'destaque' => false,
            'gere_stock' => true,
            'stock_atual' => 10,
            'stock_minimo' => 1,
            'ordem' => 1,
        ]);
    }

    private function createLegacyVariant(string $legacyProductId, string $cor, string $sku, float $precoExtra): LojaProdutoVariante
    {
        return LojaProdutoVariante::create([
            'loja_produto_id' => $legacyProductId,
            'nome' => 'Base',
            'tamanho' => 'M',
            'cor' => $cor,
            'sku' => $sku,
            'preco_extra' => $precoExtra,
            'stock_atual' => 4,
            'ativo' => true,
        ]);
    }
}