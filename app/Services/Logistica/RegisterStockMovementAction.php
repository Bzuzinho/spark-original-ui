<?php

namespace App\Services\Logistica;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RegisterStockMovementAction
{
    public function execute(array $data, ?User $actor = null): StockMovement
    {
        return DB::transaction(function () use ($data, $actor) {
            $product = Product::query()->lockForUpdate()->findOrFail($data['article_id']);
            $movementType = (string) $data['movement_type'];
            $quantity = (int) $data['quantity'];

            if ($quantity === 0) {
                throw ValidationException::withMessages([
                    'quantity' => 'A quantidade não pode ser zero.',
                ]);
            }

            $this->applyMovement($product, $movementType, $quantity);

            $product->save();

            return StockMovement::create([
                'article_id' => $product->id,
                'movement_type' => $movementType,
                'quantity' => $quantity,
                'unit_cost' => null,
                'reference_type' => $data['reference_type'] ?? null,
                'reference_id' => $data['reference_id'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => $actor?->id ?? ($data['created_by'] ?? null),
            ]);
        });
    }

    private function applyMovement(Product $product, string $movementType, int $quantity): void
    {
        $stock = (int) $product->stock;
        $reserved = (int) ($product->stock_reservado ?? 0);

        switch ($movementType) {
            case 'entry':
            case 'return':
                $product->stock = $stock + $quantity;
                break;

            case 'exit':
                if ($quantity < 0) {
                    throw ValidationException::withMessages(['quantity' => 'Saída de stock requer quantidade positiva.']);
                }

                if ($stock < $quantity) {
                    throw ValidationException::withMessages(['quantity' => 'Stock disponível insuficiente para saída.']);
                }

                $product->stock = $stock - $quantity;
                break;

            case 'reservation':
                if ($quantity < 0) {
                    throw ValidationException::withMessages(['quantity' => 'Reserva requer quantidade positiva.']);
                }

                if ($stock < $quantity) {
                    throw ValidationException::withMessages(['quantity' => 'Stock disponível insuficiente para reservar.']);
                }

                $product->stock = $stock - $quantity;
                $product->stock_reservado = $reserved + $quantity;
                break;

            case 'cancel_reservation':
                if ($quantity < 0) {
                    throw ValidationException::withMessages(['quantity' => 'Anular reserva requer quantidade positiva.']);
                }

                if ($reserved < $quantity) {
                    throw ValidationException::withMessages(['quantity' => 'Quantidade reservada insuficiente para anular.']);
                }

                $product->stock = $stock + $quantity;
                $product->stock_reservado = $reserved - $quantity;
                break;

            case 'deliver_reservation':
                if ($quantity < 0) {
                    throw ValidationException::withMessages(['quantity' => 'Entrega de reserva requer quantidade positiva.']);
                }

                if ($reserved < $quantity) {
                    throw ValidationException::withMessages(['quantity' => 'Quantidade reservada insuficiente para entrega.']);
                }

                $product->stock_reservado = $reserved - $quantity;
                break;

            default:
                throw ValidationException::withMessages([
                    'movement_type' => 'Tipo de movimento inválido.',
                ]);
        }
    }
}
