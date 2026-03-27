<?php

namespace App\Services\Loja;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\StoreOrder;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeletePendingStoreOrderAction
{
    public function __construct(
        private RevertStockForStoreOrderAction $revertStockForStoreOrderAction
    ) {
    }

    public function execute(StoreOrder $order, User $actor): void
    {
        DB::transaction(function () use ($order) {
            $order->refresh()->load(['items', 'financialInvoice']);

            if ($order->status !== 'pending_payment') {
                throw ValidationException::withMessages([
                    'order' => 'Só é possível apagar pedidos pendentes.',
                ]);
            }

            $this->revertStockForStoreOrderAction->execute($order);

            if ($order->financial_invoice_id) {
                InvoiceItem::query()->where('fatura_id', $order->financial_invoice_id)->delete();
                Invoice::query()->where('id', $order->financial_invoice_id)->delete();
            }

            $order->items()->delete();
            $order->delete();
        });
    }
}