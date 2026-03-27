<?php

namespace App\Services\Loja;

use App\Models\Product;
use App\Models\StoreOrder;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdatePendingStoreOrderAction
{
    public function __construct(
        private RevertStockForStoreOrderAction $revertStockForStoreOrderAction,
        private RegisterStockMovementForStoreOrderAction $registerStockMovementForStoreOrderAction,
        private SyncFinancialInvoiceForStoreOrderAction $syncFinancialInvoiceForStoreOrderAction
    ) {
    }

    public function execute(StoreOrder $order, array $payload, User $actor): StoreOrder
    {
        return DB::transaction(function () use ($order, $payload, $actor) {
            $order->refresh()->load(['items', 'financialInvoice']);

            if ($order->status !== 'pending_payment') {
                throw ValidationException::withMessages([
                    'order' => 'Só é possível editar pedidos pendentes.',
                ]);
            }

            $requestedItems = collect($payload['items'] ?? []);
            $orderItems = $order->items->keyBy('id');

            if ($requestedItems->count() !== $orderItems->count()) {
                throw ValidationException::withMessages([
                    'items' => 'É necessário enviar todos os itens do pedido para edição.',
                ]);
            }

            $invalidItem = $requestedItems->first(fn (array $item) => !$orderItems->has($item['id']));
            if ($invalidItem) {
                throw ValidationException::withMessages([
                    'items' => 'Os itens enviados não pertencem ao pedido selecionado.',
                ]);
            }

            $this->revertStockForStoreOrderAction->execute($order);

            $subtotal = 0;
            $updatedItems = new Collection();

            foreach ($requestedItems as $requestedItem) {
                $orderItem = $orderItems->get($requestedItem['id']);
                $product = Product::query()->lockForUpdate()->findOrFail($orderItem->article_id);
                $quantity = (int) $requestedItem['quantity'];
                $availableStock = (int) $product->stock;

                if ($quantity > $availableStock) {
                    throw ValidationException::withMessages([
                        'items' => "Stock insuficiente para o artigo {$product->nome}.",
                    ]);
                }

                $lineTotal = (float) $orderItem->unit_price * $quantity;

                $orderItem->update([
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                    'article_code_snapshot' => $product->codigo,
                    'article_name_snapshot' => $product->nome,
                ]);

                $updatedItems->push($orderItem->fresh());
                $subtotal += $lineTotal;
            }

            $order->update([
                'notes' => $payload['notes'] ?? null,
                'subtotal' => $subtotal,
                'total' => $subtotal,
            ]);

            $invoice = $this->syncFinancialInvoiceForStoreOrderAction->execute($order->fresh('items'));

            $order->update([
                'financial_invoice_id' => $invoice->id,
            ]);

            $this->registerStockMovementForStoreOrderAction->execute($order, $updatedItems, $actor);

            return $order->fresh(['items', 'financialInvoice', 'user', 'targetUser']);
        });
    }
}