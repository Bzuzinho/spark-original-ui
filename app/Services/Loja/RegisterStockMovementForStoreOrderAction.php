<?php

namespace App\Services\Loja;

use App\Models\StoreOrder;
use App\Models\StoreOrderItem;
use App\Models\User;
use App\Services\Logistica\RegisterStockMovementAction;
use Illuminate\Support\Collection;

class RegisterStockMovementForStoreOrderAction
{
    public function __construct(
        private RegisterStockMovementAction $registerStockMovementAction
    ) {
    }

    /**
     * @param Collection<int, StoreOrderItem> $items
     */
    public function execute(StoreOrder $order, Collection $items, ?User $actor = null): void
    {
        foreach ($items as $item) {
            $this->registerStockMovementAction->execute([
                'article_id' => $item->article_id,
                'movement_type' => 'exit',
                'quantity' => (int) $item->quantity,
                'unit_cost' => (float) $item->unit_price,
                'reference_type' => 'store_order',
                'reference_id' => $order->id,
                'notes' => 'Saida de stock por encomenda da Loja do Clube',
            ], $actor);
        }
    }
}
