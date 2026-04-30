<?php

namespace App\Console\Commands;

use App\Models\LojaProduto;
use App\Services\Catalog\CanonicalProductCatalogService;
use App\Services\Catalog\CanonicalProductVariantService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CatalogBackfillStoreProductsIntoProducts extends Command
{
    protected $signature = 'catalog:backfill-store-products-into-products
        {--dry-run : Simula a migracao sem persistir dados}
        {--limit=0 : Limita o numero de produtos legados processados}
        {--report= : Caminho opcional para guardar relatorio JSON}';

    protected $description = 'Migra loja_produtos e loja_produto_variantes para o catalogo canonico products/product_variants';

    public function handle(
        CanonicalProductCatalogService $catalogService,
        CanonicalProductVariantService $variantService,
    ): int {
        if (! Schema::hasTable('loja_produtos') || ! Schema::hasTable('products') || ! Schema::hasTable('product_variants') || ! Schema::hasTable('product_catalog_migrations')) {
            $this->error('Faltam tabelas necessarias: confirmar products, loja_produtos, product_variants e product_catalog_migrations.');

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');
        $limit = max(0, (int) $this->option('limit'));
        $reportPath = $this->option('report');
        $stats = [
            'products_created' => 0,
            'products_matched' => 0,
            'products_already_mapped' => 0,
            'product_conflicts' => 0,
            'variants_created' => 0,
            'variants_matched' => 0,
            'variants_already_mapped' => 0,
            'variant_conflicts' => 0,
        ];
        $report = [
            'dry_run' => $dryRun,
            'generated_at' => now()->toIso8601String(),
            'products' => [],
            'variants' => [],
            'conflicts' => [],
            'stats' => &$stats,
        ];

        $query = LojaProduto::query()->with('variantes')->ordered();
        if ($limit > 0) {
            $query->limit($limit);
        }

        $legacyProducts = $query->get();
        if ($legacyProducts->isEmpty()) {
            $this->info('Nao existem produtos legados para processar.');
            $this->writeReport($reportPath, $report);

            return self::SUCCESS;
        }

        foreach ($legacyProducts as $legacyProduct) {
            $resolution = $catalogService->resolveBackfillTarget($legacyProduct);

            if ($resolution['status'] !== 'ok' || ! $resolution['product']) {
                $stats['product_conflicts']++;
                $message = sprintf('[produto conflito] %s (%s) - %s', $legacyProduct->nome, $legacyProduct->id, $resolution['reason'] ?? 'Sem motivo');
                $this->warn($message);
                $report['conflicts'][] = [
                    'type' => 'product',
                    'legacy_id' => $legacyProduct->id,
                    'legacy_name' => $legacyProduct->nome,
                    'reason' => $resolution['reason'],
                ];
                continue;
            }

            $product = $resolution['product'];
            $productAction = $resolution['action'] ?? 'unknown';

            if (! $dryRun) {
                DB::transaction(function () use ($product) {
                    $product->save();
                });

                $catalogService->storeMapping($legacyProduct->id, $product, $productAction);
            }

            $this->incrementProductStat($stats, $productAction);
            $report['products'][] = [
                'legacy_id' => $legacyProduct->id,
                'legacy_name' => $legacyProduct->nome,
                'action' => $productAction,
                'product_id' => $product->id,
                'codigo' => $product->codigo,
            ];

            foreach ($legacyProduct->variantes as $legacyVariant) {
                $variantResolution = $variantService->resolveBackfillTarget($product, $legacyVariant);

                if ($variantResolution['status'] !== 'ok' || ! $variantResolution['variant']) {
                    $stats['variant_conflicts']++;
                    $message = sprintf('[variante conflito] %s / %s - %s', $legacyProduct->nome, $legacyVariant->id, $variantResolution['reason'] ?? 'Sem motivo');
                    $this->warn($message);
                    $report['conflicts'][] = [
                        'type' => 'variant',
                        'legacy_id' => $legacyVariant->id,
                        'legacy_name' => $legacyProduct->nome,
                        'reason' => $variantResolution['reason'],
                    ];
                    continue;
                }

                $variant = $variantResolution['variant'];
                $variantAction = $variantResolution['action'] ?? 'unknown';

                if (! $dryRun) {
                    DB::transaction(function () use ($variant) {
                        $variant->save();
                    });

                    $variantService->storeMapping($legacyVariant->id, $product, $variant, $variantAction);
                }

                $this->incrementVariantStat($stats, $variantAction);
                $report['variants'][] = [
                    'legacy_id' => $legacyVariant->id,
                    'action' => $variantAction,
                    'product_id' => $product->id,
                    'product_variant_id' => $variant->id,
                    'sku' => $variant->sku,
                ];
            }
        }

        $this->table(
            ['metric', 'value'],
            collect($stats)->map(fn ($value, $metric) => ['metric' => $metric, 'value' => $value])->values()->all()
        );

        $this->writeReport($reportPath, $report);

        $this->info($dryRun ? 'Dry-run concluido sem persistencia.' : 'Backfill concluido com persistencia.');

        return self::SUCCESS;
    }

    private function writeReport(?string $reportPath, array $report): void
    {
        if (! filled($reportPath)) {
            return;
        }

        $directory = dirname($reportPath);
        if ($directory !== '.' && ! File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        File::put($reportPath, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        $this->info(sprintf('Relatorio guardado em %s', $reportPath));
    }

    private function incrementProductStat(array &$stats, string $action): void
    {
        match ($action) {
            'create' => $stats['products_created']++,
            'match' => $stats['products_matched']++,
            'already_mapped' => $stats['products_already_mapped']++,
            default => null,
        };
    }

    private function incrementVariantStat(array &$stats, string $action): void
    {
        match ($action) {
            'create' => $stats['variants_created']++,
            'match' => $stats['variants_matched']++,
            'already_mapped' => $stats['variants_already_mapped']++,
            default => null,
        };
    }
}