<?php

namespace App\Services\Logistica;

use App\Models\EquipmentLoan;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateEquipmentLoanAction
{
    public function __construct(
        private RegisterStockMovementAction $registerStockMovementAction
    ) {
    }

    public function execute(array $data, ?User $actor = null): EquipmentLoan
    {
        return DB::transaction(function () use ($data, $actor) {
            $product = Product::query()->findOrFail($data['article_id']);
            $borrower = !empty($data['borrower_user_id'])
                ? User::query()->find($data['borrower_user_id'])
                : null;

            $loan = EquipmentLoan::create([
                'borrower_user_id' => $borrower?->id,
                'borrower_name_snapshot' => $data['borrower_name_snapshot'] ?? $borrower?->nome_completo ?? 'Pedido interno',
                'article_id' => $product->id,
                'article_name_snapshot' => $product->nome,
                'quantity' => (int) $data['quantity'],
                'loan_date' => $data['loan_date'],
                'due_date' => $data['due_date'] ?? null,
                'status' => 'active',
                'notes' => $data['notes'] ?? null,
                'created_by' => $actor?->id,
            ]);

            $this->registerStockMovementAction->execute([
                'article_id' => $product->id,
                'movement_type' => 'exit',
                'quantity' => (int) $data['quantity'],
                'reference_type' => 'equipment_loan',
                'reference_id' => $loan->id,
                'notes' => 'Saída para empréstimo de material',
            ], $actor);

            return $loan->fresh(['borrower', 'article']);
        });
    }
}
