<?php

namespace App\Console\Commands;

use App\Models\LojaProduto;
use App\Models\LojaProdutoVariante;
use App\Models\ProductCatalogMigration;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class CatalogAuditBackfillMappings extends Command
{
    protected $signature = 'catalog:audit-backfill-mappings
        {--report= : Caminho opcional para guardar relatorio JSON}';

    protected $description = 'Audita a consistencia entre o legado da loja, o catalogo canonico e a tabela tecnica de mappings';

    public function handle(): int
    {
        if (! Schema::hasTable('product_catalog_migrations')) {
            $this->error('A tabela product_catalog_migrations nao existe.');

            return self::FAILURE;
        }

        $reportPath = $this->option('report');
        $mappings = ProductCatalogMigration::query()
            ->with(['product', 'productVariant'])
            ->orderBy('legacy_source')
            ->orderBy('legacy_id')
            ->get();

        $stats = [
            'total_mappings' => $mappings->count(),
            'valid_mappings' => 0,
            'issue_count' => 0,
        ];

        $issues = [];

        foreach ($mappings as $mapping) {
            $mappingIssues = $this->inspectMapping($mapping);

            if ($mappingIssues === []) {
                $stats['valid_mappings']++;
                continue;
            }

            foreach ($mappingIssues as $issue) {
                $issues[] = $issue;
                $this->warn(sprintf('[mapping issue] %s %s - %s', $mapping->legacy_source, $mapping->legacy_id, $issue['reason']));
            }
        }

        $stats['issue_count'] = count($issues);

        $this->table(
            ['metric', 'value'],
            collect($stats)->map(fn ($value, $metric) => ['metric' => $metric, 'value' => $value])->values()->all()
        );

        $report = [
            'generated_at' => now()->toIso8601String(),
            'stats' => $stats,
            'issues' => $issues,
        ];

        $this->writeReport($reportPath, $report);

        if ($issues !== []) {
            return self::FAILURE;
        }

        $this->info('Mappings auditados sem inconsistencias.');

        return self::SUCCESS;
    }

    /**
     * @return array<int, array<string, string|null>>
     */
    private function inspectMapping(ProductCatalogMigration $mapping): array
    {
        $issues = [];

        if ($mapping->legacy_source === 'loja_produtos') {
            if (! LojaProduto::query()->whereKey($mapping->legacy_id)->exists()) {
                $issues[] = $this->issuePayload($mapping, 'Legacy product inexistente.');
            }

            if (! $mapping->product) {
                $issues[] = $this->issuePayload($mapping, 'Product canonico inexistente.');
            }

            if ($mapping->product_variant_id !== null) {
                $issues[] = $this->issuePayload($mapping, 'Mapping de produto nao deve apontar para product_variant_id.');
            }

            return $issues;
        }

        if ($mapping->legacy_source === 'loja_produto_variantes') {
            if (! LojaProdutoVariante::query()->whereKey($mapping->legacy_id)->exists()) {
                $issues[] = $this->issuePayload($mapping, 'Legacy variant inexistente.');
            }

            if (! $mapping->product) {
                $issues[] = $this->issuePayload($mapping, 'Product canonico inexistente para mapping de variante.');
            }

            if (! $mapping->productVariant) {
                $issues[] = $this->issuePayload($mapping, 'Product variant canonica inexistente.');
            }

            if ($mapping->product && $mapping->productVariant && $mapping->productVariant->product_id !== $mapping->product_id) {
                $issues[] = $this->issuePayload($mapping, 'Product variant aponta para um product_id diferente do mapping.');
            }

            return $issues;
        }

        $issues[] = $this->issuePayload($mapping, 'legacy_source desconhecido.');

        return $issues;
    }

    /**
     * @return array<string, string|null>
     */
    private function issuePayload(ProductCatalogMigration $mapping, string $reason): array
    {
        return [
            'legacy_source' => $mapping->legacy_source,
            'legacy_id' => $mapping->legacy_id,
            'product_id' => $mapping->product_id,
            'product_variant_id' => $mapping->product_variant_id,
            'reason' => $reason,
        ];
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
}