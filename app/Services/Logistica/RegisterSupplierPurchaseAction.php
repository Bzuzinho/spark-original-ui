<?php

namespace App\Services\Logistica;

use App\Models\FinancialEntry;
use App\Models\Movement;
use App\Models\MovementItem;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\SupplierPurchase;
use App\Models\SupplierPurchaseItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RegisterSupplierPurchaseAction
{
    public function __construct(
        private RegisterStockMovementAction $registerStockMovementAction
    ) {
    }

    public function execute(array $data, ?User $actor = null): SupplierPurchase
    {
        return DB::transaction(function () use ($data, $actor) {
            $items = $data['items'] ?? [];

            if (empty($items)) {
                throw ValidationException::withMessages(['items' => 'A compra deve ter pelo menos um item.']);
            }

            $supplier = Supplier::query()->findOrFail($data['supplier_id']);

            $purchase = SupplierPurchase::create([
                'supplier_id' => $supplier->id,
                'supplier_name_snapshot' => $supplier->nome,
                'invoice_reference' => $data['invoice_reference'],
                'invoice_date' => $data['invoice_date'],
                'total_amount' => 0,
                'notes' => $data['notes'] ?? null,
                'created_by' => $actor?->id,
            ]);

            $total = 0;
            foreach ($items as $item) {
                $product = Product::query()->findOrFail($item['article_id']);
                $quantity = (int) $item['quantity'];
                $unitCost = (float) $item['unit_cost'];
                $lineTotal = $quantity * $unitCost;

                SupplierPurchaseItem::create([
                    'supplier_purchase_id' => $purchase->id,
                    'article_id' => $product->id,
                    'article_name_snapshot' => $product->nome,
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'line_total' => $lineTotal,
                ]);

                $this->registerStockMovementAction->execute([
                    'article_id' => $product->id,
                    'movement_type' => 'entry',
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'reference_type' => 'supplier_purchase',
                    'reference_id' => $purchase->id,
                    'notes' => 'Entrada de stock por compra a fornecedor',
                ], $actor);

                $total += $lineTotal;
            }

            $purchase->update(['total_amount' => $total]);

            $movement = Movement::create([
                'nome_manual' => $purchase->supplier_name_snapshot,
                'classificacao' => 'despesa',
                'data_emissao' => $purchase->invoice_date,
                'data_vencimento' => $purchase->invoice_date,
                'valor_total' => $total,
                'estado_pagamento' => 'pendente',
                'centro_custo_id' => $data['centro_custo_id'] ?? null,
                'tipo' => 'fornecedor',
                'origem_tipo' => 'stock',
                'origem_id' => $purchase->id,
                'referencia_pagamento' => $purchase->invoice_reference,
                'observacoes' => 'Despesa gerada pela compra de fornecedor na logística.',
            ]);

            foreach ($purchase->items as $item) {
                MovementItem::create([
                    'movimento_id' => $movement->id,
                    'descricao' => $item->article_name_snapshot,
                    'quantidade' => $item->quantity,
                    'valor_unitario' => $item->unit_cost,
                    'imposto_percentual' => 0,
                    'total_linha' => $item->line_total,
                    'produto_id' => $item->article_id,
                    'centro_custo_id' => $data['centro_custo_id'] ?? null,
                ]);
            }

            $financialEntry = FinancialEntry::create([
                'data' => $purchase->invoice_date,
                'tipo' => 'despesa',
                'categoria' => 'Compras fornecedor',
                'descricao' => 'Compra a fornecedor: '.$purchase->supplier_name_snapshot,
                'documento_ref' => $purchase->invoice_reference,
                'valor' => $total,
                'centro_custo_id' => $data['centro_custo_id'] ?? null,
                'origem_tipo' => 'stock',
                'origem_id' => $purchase->id,
                'metodo_pagamento' => $data['metodo_pagamento'] ?? null,
                'user_id' => $actor?->id,
            ]);

            $purchase->update([
                'financial_movement_id' => $movement->id,
                'financial_entry_id' => $financialEntry->id,
            ]);

            return $purchase->fresh(['items', 'supplier', 'financialMovement', 'financialEntry']);
        });
    }
}
