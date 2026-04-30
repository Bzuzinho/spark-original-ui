<?php

namespace App\Console\Commands;

use App\Models\LojaProduto;
use App\Models\Product;
use App\Models\ProductCatalogMigration;
use App\Models\ProductVariant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class CatalogResetBackfillFixtures extends Command
{
    protected $signature = 'catalog:reset-backfill-fixtures
        {--seed-prefix=LEG-SEED- : Prefixo dos codigos de fixtures a remover}
        {--reports-only : Remove apenas relatorios gerados em storage/app/testing}
        {--force : Executa sem pedir confirmacao}';

    protected $description = 'Limpa fixtures controladas do passo 1 do catalogo legado/canonico e os relatorios de ensaio';

    public function handle(): int
    {
        $prefix = (string) $this->option('seed-prefix');
        $reportsOnly = (bool) $this->option('reports-only');

        if (! $this->option('force') && ! $this->confirm('Isto remove fixtures controladas do passo 1 e relatorios de ensaio. Continuar?')) {
            $this->info('Operacao cancelada.');

            return self::SUCCESS;
        }

        $deletedReports = $this->deleteReports();

        if ($reportsOnly) {
            $this->info(sprintf('Relatorios removidos: %d', $deletedReports));

            return self::SUCCESS;
        }

        if (! Schema::hasTable('loja_produtos') || ! Schema::hasTable('products') || ! Schema::hasTable('product_catalog_migrations')) {
            $this->error('Faltam tabelas necessarias para limpar fixtures do catalogo.');

            return self::FAILURE;
        }

        $stats = DB::transaction(function () use ($prefix) {
            $legacyProducts = LojaProduto::query()
                ->where('codigo', 'like', $prefix . '%')
                ->with('variantes')
                ->get();

            $legacyProductIds = $legacyProducts->pluck('id')->all();
            $legacyVariantIds = $legacyProducts->flatMap(fn (LojaProduto $product) => $product->variantes->pluck('id'))->values()->all();

            $mappingQuery = ProductCatalogMigration::query()->where(function ($query) use ($legacyProductIds, $legacyVariantIds) {
                if ($legacyProductIds !== []) {
                    $query->orWhere(function ($subQuery) use ($legacyProductIds) {
                        $subQuery->where('legacy_source', 'loja_produtos')
                            ->whereIn('legacy_id', $legacyProductIds);
                    });
                }

                if ($legacyVariantIds !== []) {
                    $query->orWhere(function ($subQuery) use ($legacyVariantIds) {
                        $subQuery->where('legacy_source', 'loja_produto_variantes')
                            ->whereIn('legacy_id', $legacyVariantIds);
                    });
                }
            });

            $mappings = $mappingQuery->get();
            $canonicalProductIds = $mappings->pluck('product_id')->filter()->unique()->values()->all();
            $canonicalVariantIds = $mappings->pluck('product_variant_id')->filter()->unique()->values()->all();

            $deletedMappings = 0;
            if ($mappings->isNotEmpty()) {
                $deletedMappings = ProductCatalogMigration::query()
                    ->whereIn('id', $mappings->pluck('id')->all())
                    ->delete();
            }

            $deletedCanonicalVariants = 0;
            if ($canonicalVariantIds !== []) {
                $deletedCanonicalVariants = ProductVariant::query()
                    ->whereIn('id', $canonicalVariantIds)
                    ->delete();
            }

            $deletedCanonicalProducts = 0;
            if ($canonicalProductIds !== []) {
                $deletedCanonicalProducts = Product::query()
                    ->whereIn('id', $canonicalProductIds)
                    ->delete();
            }

            $deletedLegacyVariants = 0;
            if ($legacyVariantIds !== []) {
                $deletedLegacyVariants = DB::table('loja_produto_variantes')
                    ->whereIn('id', $legacyVariantIds)
                    ->delete();
            }

            $deletedLegacyProducts = 0;
            if ($legacyProductIds !== []) {
                $deletedLegacyProducts = DB::table('loja_produtos')
                    ->whereIn('id', $legacyProductIds)
                    ->delete();
            }

            return [
                'legacy_products' => $deletedLegacyProducts,
                'legacy_variants' => $deletedLegacyVariants,
                'canonical_products' => $deletedCanonicalProducts,
                'canonical_variants' => $deletedCanonicalVariants,
                'mappings' => $deletedMappings,
            ];
        });

        $this->table(
            ['artifact', 'deleted'],
            [
                ['artifact' => 'legacy_products', 'deleted' => $stats['legacy_products']],
                ['artifact' => 'legacy_variants', 'deleted' => $stats['legacy_variants']],
                ['artifact' => 'canonical_products', 'deleted' => $stats['canonical_products']],
                ['artifact' => 'canonical_variants', 'deleted' => $stats['canonical_variants']],
                ['artifact' => 'mappings', 'deleted' => $stats['mappings']],
                ['artifact' => 'reports', 'deleted' => $deletedReports],
            ]
        );

        $this->info('Fixtures controladas do passo 1 removidas.');

        return self::SUCCESS;
    }

    private function deleteReports(): int
    {
        $patterns = [
            storage_path('app/testing/manual-catalog-backfill-report.json'),
            storage_path('app/testing/manual-catalog-backfill-report-persisted.json'),
            storage_path('app/testing/catalog-backfill-report.json'),
            storage_path('app/testing/catalog-backfill-variant-conflict-report.json'),
        ];

        $deleted = 0;

        foreach ($patterns as $filePath) {
            if (File::exists($filePath)) {
                File::delete($filePath);
                $deleted++;
            }
        }

        return $deleted;
    }
}