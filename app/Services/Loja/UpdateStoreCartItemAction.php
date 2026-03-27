<?php

namespace App\Services\Loja;

use App\Models\Product;
use App\Models\StoreCartItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateStoreCartItemAction
{
    public function execute(StoreCartItem $cartItem, array $payload, User $actor): StoreCartItem
    {
        return DB::transaction(function () use ($cartItem, $payload, $actor) {
            $cartItem->refresh();

            if ($cartItem->user_id !== $actor->id) {
                throw ValidationException::withMessages([
                    'cart_item' => 'Item do carrinho inválido para este utilizador.',
                ]);
            }

            $quantity = (int) $payload['quantity'];
            $variant = $this->normalizeVariant($payload['variant'] ?? $cartItem->variant);

            $product = Product::query()->lockForUpdate()->findOrFail($cartItem->article_id);

            $availableStock = (int) $product->stock;
            if ($quantity > $availableStock) {
                throw ValidationException::withMessages([
                    'quantity' => 'Quantidade solicitada excede o stock disponível.',
                ]);
            }

            if (!$product->ativo || !(bool) ($product->visible_in_store ?? false)) {
                throw ValidationException::withMessages([
                    'article_id' => 'Este artigo já não está disponível na loja.',
                ]);
            }

            $cartItem->update([
                'quantity' => $quantity,
                'variant' => $variant,
            ]);

            return $cartItem->fresh(['article']);
        });
    }

    private function normalizeVariant(?string $variant): ?string
    {
        $variant = is_string($variant) ? trim($variant) : null;

        return $variant === '' ? null : $variant;
    }
}
