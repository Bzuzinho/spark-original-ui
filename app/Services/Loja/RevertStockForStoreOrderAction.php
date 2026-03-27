<?php

namespace App\Services\Loja;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\StoreOrder;

class RevertStockForStoreOrderAction
{
    public function execute(StoreOrder $order): void
    {
        $order->loadMissing('items');

        foreach ($order->items as $item) {
            $product = Product::query()->lockForUpdate()->findOrFail($item->article_id);
            $product->stock = (int) $product->stock + (int) $item->quantity;
            $product->save();
        }

        StockMovement::query()
            ->where('reference_type', 'store_order')
            ->where('reference_id', $order->id)
            ->delete();
    }
}