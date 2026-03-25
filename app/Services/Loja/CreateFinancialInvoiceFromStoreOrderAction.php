<?php

namespace App\Services\Loja;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoiceType;
use App\Models\StoreOrder;

class CreateFinancialInvoiceFromStoreOrderAction
{
    public function execute(StoreOrder $order): Invoice
    {
        $order->loadMissing('items');

        if ($order->financial_invoice_id) {
            return Invoice::query()->findOrFail($order->financial_invoice_id);
        }

        $invoiceType = InvoiceType::query()->where('codigo', 'material')->first()
            ?? InvoiceType::query()->where('ativo', true)->orderBy('nome')->first();

        $issueDate = now()->toDateString();
        $dueDate = now()->addDays(15)->toDateString();
        $targetUserId = $order->target_user_id ?: $order->user_id;

        $invoice = Invoice::create([
            'user_id' => $targetUserId,
            'data_fatura' => $issueDate,
            'mes' => now()->format('Y-m'),
            'data_emissao' => $issueDate,
            'data_vencimento' => $dueDate,
            'valor_total' => $order->total,
            'oculta' => false,
            'estado_pagamento' => 'pendente',
            'tipo' => $invoiceType?->codigo ?? 'material',
            'origem_tipo' => 'store_order',
            'origem_id' => $order->id,
            'observacoes' => 'Fatura gerada automaticamente pela Loja do Clube.',
        ]);

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

        return $invoice;
    }
}
