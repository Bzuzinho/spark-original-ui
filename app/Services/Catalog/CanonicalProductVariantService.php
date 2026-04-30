<?php

namespace App\Services\Catalog;

use App\Models\LojaProdutoVariante;
use App\Models\Product;
use App\Models\ProductCatalogMigration;
use App\Models\ProductVariant;

class CanonicalProductVariantService
{
    public function findByProductVariantId(string $productVariantId): ?ProductVariant
    {
        return ProductVariant::query()->find($productVariantId);
    }

    public function resolveFromLegacyStoreVariantId(?string $legacyStoreVariantId): ?ProductVariant
    {
        if (! filled($legacyStoreVariantId)) {
            return null;
        }

        $mapping = ProductCatalogMigration::query()
            ->where('legacy_source', 'loja_produto_variantes')
            ->where('legacy_id', $legacyStoreVariantId)
            ->whereNotNull('product_variant_id')
            ->first();

        return $mapping?->productVariant;
    }

    public function resolveLegacyStoreVariantIdFromProductVariantId(?string $productVariantId): ?string
    {
        if (! filled($productVariantId)) {
            return null;
        }

        return ProductCatalogMigration::query()
            ->where('product_variant_id', $productVariantId)
            ->where('legacy_source', 'loja_produto_variantes')
            ->value('legacy_id');
    }

    /**
     * @return array{status:string,action:?string,variant:?ProductVariant,reason:?string}
     */
    public function resolveBackfillTarget(Product $product, LojaProdutoVariante $legacyVariant): array
    {
        $mappedVariant = $this->resolveFromLegacyStoreVariantId($legacyVariant->id);
        if ($mappedVariant) {
            $mappedVariant->fill($this->legacyPayload($product, $legacyVariant));

            return [
                'status' => 'ok',
                'action' => 'already_mapped',
                'variant' => $mappedVariant,
                'reason' => null,
            ];
        }

        if (filled($legacyVariant->sku)) {
            $matchedBySku = ProductVariant::query()
                ->where('sku', $legacyVariant->sku)
                ->first();

            if ($matchedBySku) {
                if ($matchedBySku->product_id !== $product->id) {
                    return [
                        'status' => 'conflict',
                        'action' => null,
                        'variant' => $matchedBySku,
                        'reason' => 'SKU ja existe noutra variante canonica.',
                    ];
                }

                $matchedBySku->fill($this->legacyPayload($product, $legacyVariant));

                return [
                    'status' => 'ok',
                    'action' => 'match',
                    'variant' => $matchedBySku,
                    'reason' => null,
                ];
            }
        }

        return [
            'status' => 'ok',
            'action' => 'create',
            'variant' => new ProductVariant($this->legacyPayload($product, $legacyVariant)),
            'reason' => null,
        ];
    }

    public function legacyPayload(Product $product, LojaProdutoVariante $legacyVariant): array
    {
        return [
            'product_id' => $product->id,
            'nome' => $legacyVariant->nome,
            'sku' => $legacyVariant->sku,
            'tamanho' => $legacyVariant->tamanho,
            'cor' => $legacyVariant->cor,
            'atributos_json' => null,
            'preco_extra' => $legacyVariant->preco_extra,
            'stock' => $legacyVariant->stock_atual,
            'stock_reservado' => 0,
            'ativo' => $legacyVariant->ativo,
        ];
    }

    public function storeMapping(string $legacyId, Product $product, ProductVariant $variant, ?string $notes = null): void
    {
        ProductCatalogMigration::query()->updateOrCreate(
            [
                'legacy_source' => 'loja_produto_variantes',
                'legacy_id' => $legacyId,
            ],
            [
                'product_id' => $product->id,
                'product_variant_id' => $variant->id,
                'migrated_at' => now(),
                'notes' => $notes,
            ]
        );
    }
}