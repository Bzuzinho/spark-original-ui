<?php

namespace App\Services\Loja;

use App\Models\Product;
use App\Models\StoreCartItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AddToStoreCartAction
{
    public function __construct(
        private StoreProfileResolver $profileResolver
    ) {
    }

    public function execute(array $payload, User $actor): StoreCartItem
    {
        return DB::transaction(function () use ($payload, $actor) {
            $targetUserId = $this->profileResolver->normalizeTargetUserId($actor, $payload['target_user_id'] ?? null);
            $quantityToAdd = (int) $payload['quantity'];
            $variant = $this->normalizeVariant($payload['variant'] ?? null);

            $product = Product::query()->lockForUpdate()->findOrFail($payload['article_id']);

            if (!$product->ativo || !(bool) ($product->visible_in_store ?? false)) {
                throw ValidationException::withMessages([
                    'article_id' => 'Este artigo não está disponível na loja.',
                ]);
            }

            $availableStock = (int) $product->stock;

            $existing = StoreCartItem::query()
                ->where('user_id', $actor->id)
                ->where('article_id', $product->id)
                ->where(function ($query) use ($targetUserId) {
                    if ($targetUserId === null) {
                        $query->whereNull('target_user_id');
                        return;
                    }

                    $query->where('target_user_id', $targetUserId);
                })
                ->where('variant', $variant)
                ->lockForUpdate()
                ->first();

            $finalQuantity = $quantityToAdd + (int) ($existing?->quantity ?? 0);
            if ($finalQuantity > $availableStock) {
                throw ValidationException::withMessages([
                    'quantity' => 'Quantidade solicitada excede o stock disponível.',
                ]);
            }

            if ($existing) {
                $existing->update([
                    'quantity' => $finalQuantity,
                ]);

                return $existing->fresh();
            }

            return StoreCartItem::create([
                'user_id' => $actor->id,
                'target_user_id' => $targetUserId,
                'article_id' => $product->id,
                'variant' => $variant,
                'quantity' => $finalQuantity,
            ]);
        });
    }

    private function normalizeVariant(?string $variant): ?string
    {
        $variant = is_string($variant) ? trim($variant) : null;

        return $variant === '' ? null : $variant;
    }
}
