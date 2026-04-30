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

class CatalogAuditBackfillMappingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_audit_command_passes_for_consistent_mappings(): void
    {
        [$legacyProduct, $legacyVariant, $product, $productVariant] = $this->createConsistentMappingFixture();

        $exitCode = Artisan::call('catalog:audit-backfill-mappings');

        $this->assertSame(0, $exitCode);
        $this->assertDatabaseHas('product_catalog_migrations', [
            'legacy_source' => 'loja_produtos',
            'legacy_id' => $legacyProduct->id,
            'product_id' => $product->id,
        ]);
        $this->assertDatabaseHas('product_catalog_migrations', [
            'legacy_source' => 'loja_produto_variantes',
            'legacy_id' => $legacyVariant->id,
            'product_variant_id' => $productVariant->id,
        ]);
    }

    public function test_audit_command_reports_inconsistent_mappings_and_writes_report(): void
    {
        [$legacyProduct, $legacyVariant, $product] = $this->createConsistentMappingFixture();

        $otherProduct = Product::create([
            'codigo' => 'AUD-OTHER-001',
            'nome' => 'Outro Canonico',
            'descricao' => 'Outro produto',
            'categoria' => 'Merchandising',
            'preco' => 5.00,
            'preco_venda' => 5.00,
            'stock' => 1,
            'stock_reservado' => 0,
            'stock_minimo' => 0,
            'ativo' => true,
            'visible_in_store' => false,
            'allow_sale' => true,
            'allow_request' => false,
            'allow_loan' => false,
            'track_stock' => true,
        ]);

        $otherVariant = ProductVariant::create([
            'product_id' => $otherProduct->id,
            'nome' => 'Base',
            'sku' => 'AUD-OTHER-VAR',
            'tamanho' => 'M',
            'cor' => 'Preto',
            'atributos_json' => null,
            'preco_extra' => 0,
            'stock' => 1,
            'stock_reservado' => 0,
            'ativo' => true,
        ]);

        ProductCatalogMigration::query()
            ->where('legacy_source', 'loja_produto_variantes')
            ->where('legacy_id', $legacyVariant->id)
            ->update([
                'product_id' => $product->id,
                'product_variant_id' => $otherVariant->id,
            ]);

        ProductCatalogMigration::create([
            'legacy_source' => 'loja_produtos',
            'legacy_id' => '00000000-0000-0000-0000-000000000999',
            'product_id' => null,
            'product_variant_id' => null,
            'migrated_at' => now(),
            'notes' => 'broken',
        ]);

        $reportPath = storage_path('app/testing/catalog-audit-report.json');
        File::delete($reportPath);

        $exitCode = Artisan::call('catalog:audit-backfill-mappings', [
            '--report' => $reportPath,
        ]);

        $this->assertSame(1, $exitCode);
        $this->assertTrue(File::exists($reportPath));

        $report = json_decode((string) File::get($reportPath), true, 512, JSON_THROW_ON_ERROR);

        $this->assertSame(3, $report['stats']['issue_count']);
        $this->assertCount(3, $report['issues']);
    }

    /**
     * @return array{0: LojaProduto, 1: LojaProdutoVariante, 2: Product, 3: ProductVariant}
     */
    private function createConsistentMappingFixture(): array
    {
        $category = ItemCategory::create([
            'codigo' => 'AUD-CAT-001',
            'nome' => 'Auditoria',
            'contexto' => 'loja',
            'ativo' => true,
        ]);

        $legacyProduct = LojaProduto::create([
            'categoria_id' => $category->id,
            'codigo' => 'AUD-001',
            'nome' => 'Produto Auditoria',
            'slug' => 'produto-auditoria',
            'descricao' => 'Produto legacy',
            'preco' => 10.00,
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
            'sku' => 'AUD-001-M-AZ',
            'preco_extra' => 0,
            'stock_atual' => 2,
            'ativo' => true,
        ]);

        $product = Product::create([
            'codigo' => 'AUD-001',
            'nome' => 'Produto Auditoria',
            'descricao' => 'Produto canonico',
            'categoria' => 'Auditoria',
            'preco' => 10.00,
            'preco_venda' => 10.00,
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
            'sku' => 'AUD-001-M-AZ',
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

        return [$legacyProduct, $legacyVariant, $product, $productVariant];
    }
}