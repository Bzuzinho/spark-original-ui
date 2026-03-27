<?php

namespace App\Services\Loja;

use App\Models\Product;
use App\Models\StoreCartItem;
use App\Models\StoreOrder;
use App\Models\StoreOrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConfirmStoreOrderAction
{
    public function __construct(
        private StoreProfileResolver $profileResolver,
        private RegisterStockMovementForStoreOrderAction $registerStockMovementForStoreOrderAction,
        private CreateFinancialInvoiceFromStoreOrderAction $createFinancialInvoiceFromStoreOrderAction
    ) {
    }

    public function execute(array $payload, User $actor): StoreOrder
    {
        return DB::transaction(function () use ($payload, $actor) {
            $targetUserId = $this->profileResolver->normalizeTargetUserId($actor, $payload['target_user_id'] ?? null);

            $cartItems = StoreCartItem::query()
                ->where('user_id', $actor->id)
                ->where(function ($query) use ($targetUserId) {
                    if ($targetUserId === null) {
                        $query->whereNull('target_user_id');
                        return;
                    }

                    $query->where('target_user_id', $targetUserId);
                })
                ->lockForUpdate()
                ->get();

            if ($cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => 'O carrinho está vazio para o perfil selecionado.',
                ]);
            }

            $order = StoreOrder::create([
                'user_id' => $actor->id,
                'target_user_id' => $targetUserId,
                'status' => 'pending_payment',
                'subtotal' => 0,
                'total' => 0,
                'notes' => $payload['notes'] ?? null,
            ]);

            $subtotal = 0;
            $orderItems = collect();

            foreach ($cartItems as $cartItem) {
                $product = Product::query()->lockForUpdate()->findOrFail($cartItem->article_id);

                if (!$product->ativo || !(bool) ($product->visible_in_store ?? false)) {
                    throw ValidationException::withMessages([
                        'cart' => "O artigo {$product->nome} já não está disponível na loja.",
                    ]);
                }

                $availableStock = (int) $product->stock;
                if ((int) $cartItem->quantity > $availableStock) {
                    throw ValidationException::withMessages([
                        'cart' => "Stock insuficiente para o artigo {$product->nome}.",
                    ]);
                }

                $unitPrice = (float) $product->preco;
                $lineTotal = $unitPrice * (int) $cartItem->quantity;

                $orderItem = StoreOrderItem::create([
                    'store_order_id' => $order->id,
                    'article_id' => $product->id,
                    'article_code_snapshot' => $product->codigo,
                    'article_name_snapshot' => $product->nome,
                    'variant_snapshot' => $cartItem->variant,
                    'quantity' => (int) $cartItem->quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ]);

                $orderItems->push($orderItem);
                $subtotal += $lineTotal;
            }

            $order->update([
                'subtotal' => $subtotal,
                'total' => $subtotal,
            ]);

            $this->registerStockMovementForStoreOrderAction->execute($order, $orderItems, $actor);

            $invoice = $this->createFinancialInvoiceFromStoreOrderAction->execute($order);

            $order->update([
                'financial_invoice_id' => $invoice->id,
            ]);

            StoreCartItem::query()
                ->whereIn('id', $cartItems->pluck('id'))
                ->delete();

            return $order->fresh(['items', 'financialInvoice', 'user', 'targetUser']);
        });
    }
}
