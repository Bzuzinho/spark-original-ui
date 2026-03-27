<?php

namespace App\Services\Loja;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\StoreOrder;

class SyncFinancialInvoiceForStoreOrderAction
{
    public function __construct(
        private CreateFinancialInvoiceFromStoreOrderAction $createFinancialInvoiceFromStoreOrderAction
    ) {
    }

    public function execute(StoreOrder $order): Invoice
    {
        $order->loadMissing('items');

        if (!$order->financial_invoice_id) {
            return $this->createFinancialInvoiceFromStoreOrderAction->execute($order);
        }

        $invoice = Invoice::query()->find($order->financial_invoice_id);
        if (!$invoice) {
            return $this->createFinancialInvoiceFromStoreOrderAction->execute($order);
        }

        $targetUserId = $order->target_user_id ?: $order->user_id;

        $invoice->update([
            'user_id' => $targetUserId,
            'valor_total' => $order->total,
            'observacoes' => 'Fatura gerada automaticamente pela Loja do Clube.',
        ]);

        InvoiceItem::query()->where('fatura_id', $invoice->id)->delete();

        foreach ($order->items as $item) {
            $descricao = $item->article_name_snapshot;
            if (!empty($item->variant_snapshot)) {
                $descricao .= ' (' . $item->variant_snapshot . ')';
            }

            InvoiceItem::create([
                'fatura_id' => $invoice->id,
                'descricao' => $descricao,
                'quantidade' => $item->quantity,
                'valor_unitario' => $item->unit_price,
                'imposto_percentual' => 0,
                'total_linha' => $item->line_total,
                'produto_id' => $item->article_id,
            ]);
        }

        return $invoice->fresh('items');
    }
}