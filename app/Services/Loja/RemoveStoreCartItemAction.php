<?php

namespace App\Services\Loja;

use App\Models\StoreCartItem;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class RemoveStoreCartItemAction
{
    public function execute(StoreCartItem $cartItem, User $actor): void
    {
        if ($cartItem->user_id !== $actor->id) {
            throw ValidationException::withMessages([
                'cart_item' => 'Item do carrinho inválido para este utilizador.',
            ]);
        }

        $cartItem->delete();
    }
}
