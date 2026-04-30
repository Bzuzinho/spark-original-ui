<?php

namespace App\Services\Catalog;

use App\Models\LojaProduto;
use App\Models\Product;
use App\Models\ProductCatalogMigration;

class CanonicalProductCatalogService
{
    public function findByProductId(string $productId): ?Product
    {
        return Product::query()->find($productId);
    }

    public function resolveFromLegacyStoreProductId(?string $legacyStoreProductId): ?Product
    {
        if (! filled($legacyStoreProductId)) {
            return null;
        }

        $mapping = ProductCatalogMigration::query()
            ->where('legacy_source', 'loja_produtos')
            ->where('legacy_id', $legacyStoreProductId)
            ->whereNotNull('product_id')
            ->first();

        return $mapping?->product;
    }

    public function resolveLegacyStoreProductIdFromProductId(?string $productId): ?string
    {
        if (! filled($productId)) {
            return null;
        }

        return ProductCatalogMigration::query()
            ->where('product_id', $productId)
            ->where('legacy_source', 'loja_produtos')
            ->value('legacy_id');
    }

    /**
     * @return array{status:string,action:?string,product:?Product,reason:?string}
     */
    public function resolveBackfillTarget(LojaProduto $legacyProduct): array
    {
        $mappedProduct = $this->resolveFromLegacyStoreProductId($legacyProduct->id);
        if ($mappedProduct) {
            return [
                'status' => 'ok',
                'action' => 'already_mapped',
                'product' => $mappedProduct,
                'reason' => null,
            ];
        }

        if (! filled($legacyProduct->codigo)) {
            return [
                'status' => 'conflict',
                'action' => null,
                'product' => null,
                'reason' => 'Produto legado sem codigo; nao e seguro criar ou reconciliar automaticamente.',
            ];
        }

        $matchedByCode = Product::query()
            ->where('codigo', $legacyProduct->codigo)
            ->first();

        if (! $matchedByCode) {
            return [
                'status' => 'ok',
                'action' => 'create',
                'product' => new Product($this->legacyPayload($legacyProduct)),
                'reason' => null,
            ];
        }

        if ($this->hasUnsafeCodeMatchConflict($matchedByCode, $legacyProduct)) {
            return [
                'status' => 'conflict',
                'action' => null,
                'product' => $matchedByCode,
                'reason' => 'Codigo ja existe em products com dados divergentes; validar manualmente antes de mapear.',
            ];
        }

        $matchedByCode->fill($this->legacyPayload($legacyProduct));

        return [
            'status' => 'ok',
            'action' => 'match',
            'product' => $matchedByCode,
            'reason' => null,
        ];
    }

    public function legacyPayload(LojaProduto $legacyProduct): array
    {
        return [
            'nome' => $legacyProduct->nome,
            'descricao' => $legacyProduct->descricao,
            'codigo' => $legacyProduct->codigo,
            'slug' => $legacyProduct->slug,
            'categoria_id' => $legacyProduct->categoria_id,
            'preco' => $legacyProduct->preco,
            'preco_venda' => $legacyProduct->preco,
            'stock' => $legacyProduct->stock_atual,
            'stock_minimo' => $legacyProduct->stock_minimo,
            'imagem' => $legacyProduct->imagem_principal_path,
            'ativo' => $legacyProduct->ativo,
            'visible_in_store' => $legacyProduct->ativo,
            'destaque' => $legacyProduct->destaque,
            'allow_sale' => true,
            'allow_request' => false,
            'allow_loan' => false,
            'track_stock' => $legacyProduct->gere_stock,
            'ordem' => $legacyProduct->ordem,
        ];
    }

    public function storeMapping(string $legacyId, Product $product, ?string $notes = null): void
    {
        ProductCatalogMigration::query()->updateOrCreate(
            [
                'legacy_source' => 'loja_produtos',
                'legacy_id' => $legacyId,
            ],
            [
                'product_id' => $product->id,
                'product_variant_id' => null,
                'migrated_at' => now(),
                'notes' => $notes,
            ]
        );
    }

    private function hasUnsafeCodeMatchConflict(Product $product, LojaProduto $legacyProduct): bool
    {
        return $this->normalize((string) $product->nome) !== $this->normalize((string) $legacyProduct->nome)
            || (float) $product->sale_price !== (float) $legacyProduct->preco;
    }

    private function normalize(string $value): string
    {
        return trim(mb_strtolower($value));
    }
}