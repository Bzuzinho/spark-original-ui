<?php

namespace App\Services\Logistica;

use App\Models\EquipmentLoan;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteEquipmentLoanAction
{
    public function execute(EquipmentLoan $loan): void
    {
        if (!in_array($loan->status, ['active', 'overdue'])) {
            throw ValidationException::withMessages([
                'status' => 'Só é possível apagar empréstimos ativos ou em atraso.',
            ]);
        }

        DB::transaction(function () use ($loan) {
            if ($loan->article_id) {
                $product = Product::query()->lockForUpdate()->find($loan->article_id);
                if ($product) {
                    $product->stock = (int) $product->stock + (int) $loan->quantity;
                    $product->save();
                }
            }

            $loan->delete();
        });
    }
}
