<?php

namespace App\Services\Logistica;

use App\Models\EquipmentLoan;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateEquipmentLoanAction
{
    public function execute(EquipmentLoan $loan, array $data): EquipmentLoan
    {
        if (!in_array($loan->status, ['active', 'overdue'])) {
            throw ValidationException::withMessages([
                'status' => 'Só é possível editar empréstimos ativos ou em atraso.',
            ]);
        }

        return DB::transaction(function () use ($loan, $data) {
            $newArticleId = $data['article_id'];
            $newQuantity = (int) $data['quantity'];
            $oldQuantity = (int) $loan->quantity;
            $oldArticleId = $loan->article_id;

            if ($oldArticleId === $newArticleId) {
                // Mesmo artigo: ajusta a diferença de stock
                $diff = $newQuantity - $oldQuantity;
                if ($diff !== 0) {
                    $product = Product::query()->lockForUpdate()->findOrFail($newArticleId);
                    $newStock = (int) $product->stock - $diff;

                    if ($newStock < 0) {
                        throw ValidationException::withMessages([
                            'quantity' => 'Stock insuficiente para atualizar o empréstimo.',
                        ]);
                    }

                    $product->stock = $newStock;
                    $product->save();
                }
            } else {
                // Artigo diferente: devolver stock do artigo antigo e retirar do novo
                $oldProduct = Product::query()->lockForUpdate()->findOrFail($oldArticleId);
                $oldProduct->stock = (int) $oldProduct->stock + $oldQuantity;
                $oldProduct->save();

                $newProduct = Product::query()->lockForUpdate()->findOrFail($newArticleId);
                $newProductStock = (int) $newProduct->stock - $newQuantity;

                if ($newProductStock < 0) {
                    throw ValidationException::withMessages([
                        'quantity' => 'Stock insuficiente no artigo selecionado.',
                    ]);
                }

                $newProduct->stock = $newProductStock;
                $newProduct->save();
            }

            $newProduct = Product::query()->find($newArticleId);

            $loan->update([
                'borrower_user_id' => $data['borrower_user_id'] ?? null,
                'borrower_name_snapshot' => $data['borrower_name_snapshot'],
                'article_id' => $newArticleId,
                'article_name_snapshot' => $newProduct?->nome ?? $loan->article_name_snapshot,
                'quantity' => $newQuantity,
                'loan_date' => $data['loan_date'],
                'due_date' => $data['due_date'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            return $loan->fresh();
        });
    }
}
