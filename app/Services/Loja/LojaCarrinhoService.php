<?php

namespace App\Services\Loja;

use App\Models\LojaCarrinho;
use App\Models\LojaCarrinhoItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\Catalog\CanonicalProductCatalogService;
use App\Services\Catalog\CanonicalProductVariantService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LojaCarrinhoService
{
    public function __construct(
        private readonly LojaStockService $stockService,
        private readonly CanonicalProductCatalogService $catalogService,
        private readonly CanonicalProductVariantService $variantService,
    ) {
    }

    public function getOpenCart(User $user): ?LojaCarrinho
    {
        return LojaCarrinho::query()
            ->with(['itens.article.category', 'itens.productVariant', 'itens.produto.categoria', 'itens.variante'])
            ->open()
            ->where('user_id', $user->id)
            ->latest('updated_at')
            ->first();
    }

    public function getOrCreateOpenCart(User $user): LojaCarrinho
    {
        return LojaCarrinho::query()->firstOrCreate(
            [
                'user_id' => $user->id,
                'estado' => LojaCarrinho::ESTADO_ABERTO,
            ],
            [
                'observacoes' => null,
            ]
        );
    }

    public function addItem(User $user, array $payload): LojaCarrinho
    {
        return DB::transaction(function () use ($user, $payload) {
            $cart = $this->getOrCreateOpenCart($user);
            $quantity = max(1, (int) ($payload['quantidade'] ?? 1));

            $produto = Product::query()
                ->with('variants')
                ->lockForUpdate()
                ->findOrFail($payload['article_id']);

            $variante = $this->resolveVariant($produto, $payload['product_variant_id'] ?? null, true);
            $legacyProductId = $this->catalogService->resolveLegacyStoreProductIdFromProductId($produto->id);
            $legacyVariantId = $this->variantService->resolveLegacyStoreVariantIdFromProductVariantId($variante?->id);

            $existingItem = LojaCarrinhoItem::query()
                ->where('loja_carrinho_id', $cart->id)
                ->where('article_id', $produto->id)
                ->where(function (Builder $query) use ($variante) {
                    if ($variante === null) {
                        $query->whereNull('product_variant_id');

                        return;
                    }

                    $query->where('product_variant_id', $variante->id);
                })
                ->lockForUpdate()
                ->first();

            $finalQuantity = $quantity + (int) ($existingItem?->quantidade ?? 0);
            $this->stockService->ensureDisponivel($produto, $variante, $finalQuantity);

            $unitPrice = $this->stockService->unitPrice($produto, $variante);
            $lineTotal = $unitPrice * $finalQuantity;

            if ($existingItem) {
                $existingItem->update([
                    'article_id' => $produto->id,
                    'product_variant_id' => $variante?->id,
                    'loja_produto_id' => $legacyProductId,
                    'loja_produto_variante_id' => $legacyVariantId,
                    'quantidade' => $finalQuantity,
                    'preco_unitario' => $unitPrice,
                    'total_linha' => $lineTotal,
                ]);
            } else {
                LojaCarrinhoItem::create([
                    'loja_carrinho_id' => $cart->id,
                    'article_id' => $produto->id,
                    'product_variant_id' => $variante?->id,
                    'loja_produto_id' => $legacyProductId,
                    'loja_produto_variante_id' => $legacyVariantId,
                    'quantidade' => $finalQuantity,
                    'preco_unitario' => $unitPrice,
                    'total_linha' => $lineTotal,
                ]);
            }

            if (array_key_exists('observacoes', $payload)) {
                $cart->update([
                    'observacoes' => filled($payload['observacoes']) ? $payload['observacoes'] : null,
                ]);
            }

            return $this->freshCart($cart);
        });
    }

    public function updateItem(User $user, LojaCarrinhoItem $item, array $payload): LojaCarrinho
    {
        return DB::transaction(function () use ($user, $item, $payload) {
            $cart = LojaCarrinho::query()
                ->open()
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->findOrFail($item->loja_carrinho_id);

            $produto = Product::query()
                ->with('variants')
                ->lockForUpdate()
                ->findOrFail($this->resolveArticleId($item));

            $varianteId = $payload['product_variant_id'] ?? $item->product_variant_id;
            $variante = $this->resolveVariant($produto, $varianteId, false);
            $quantity = max(1, (int) ($payload['quantidade'] ?? $item->quantidade));

            $this->stockService->ensureDisponivel($produto, $variante, $quantity);
            $unitPrice = $this->stockService->unitPrice($produto, $variante);

            $item->update([
                'article_id' => $produto->id,
                'product_variant_id' => $variante?->id,
                'loja_produto_id' => $this->catalogService->resolveLegacyStoreProductIdFromProductId($produto->id),
                'loja_produto_variante_id' => $this->variantService->resolveLegacyStoreVariantIdFromProductVariantId($variante?->id),
                'quantidade' => $quantity,
                'preco_unitario' => $unitPrice,
                'total_linha' => $unitPrice * $quantity,
            ]);

            if (array_key_exists('observacoes', $payload)) {
                $cart->update([
                    'observacoes' => filled($payload['observacoes']) ? $payload['observacoes'] : null,
                ]);
            }

            return $this->freshCart($cart);
        });
    }

    public function removeItem(User $user, LojaCarrinhoItem $item): LojaCarrinho
    {
        return DB::transaction(function () use ($user, $item) {
            $cart = LojaCarrinho::query()
                ->open()
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->findOrFail($item->loja_carrinho_id);

            $item->delete();

            return $this->freshCart($cart);
        });
    }

    public function updateObservacoes(User $user, ?string $observacoes): LojaCarrinho
    {
        $cart = $this->getOrCreateOpenCart($user);
        $cart->update([
            'observacoes' => filled($observacoes) ? $observacoes : null,
        ]);

        return $this->freshCart($cart);
    }

    private function freshCart(LojaCarrinho $cart): LojaCarrinho
    {
        return $cart->fresh(['itens.article.category', 'itens.productVariant', 'itens.produto.categoria', 'itens.variante']);
    }

    private function resolveVariant(Product $produto, ?string $variantId, bool $enforceWhenVariantsExist): ?ProductVariant
    {
        $hasVariants = $produto->variants->where('ativo', true)->isNotEmpty();

        if (! $variantId) {
            if ($hasVariants && $enforceWhenVariantsExist) {
                throw ValidationException::withMessages([
                    'product_variant_id' => 'Selecione uma variante do produto.',
                ]);
            }

            return null;
        }

        $variante = $produto->variants
            ->firstWhere('id', $variantId);

        if (! $variante) {
            throw ValidationException::withMessages([
                'product_variant_id' => 'A variante selecionada e invalida.',
            ]);
        }

        return $variante;
    }

    private function resolveArticleId(LojaCarrinhoItem $item): string
    {
        if (filled($item->article_id)) {
            return $item->article_id;
        }

        $resolved = $this->catalogService->resolveFromLegacyStoreProductId($item->loja_produto_id)?->id;

        if (! $resolved) {
            throw ValidationException::withMessages([
                'article_id' => 'O item do carrinho nao esta associado a um produto canonico valido.',
            ]);
        }

        $item->forceFill(['article_id' => $resolved])->save();

        return $resolved;
    }
}