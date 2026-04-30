<?php

namespace App\Services\Loja;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Validation\ValidationException;

class LojaStockService
{
    public function ensureDisponivel(Product $produto, ?ProductVariant $variante, int $quantidade): void
    {
        if (! $produto->ativo) {
            throw ValidationException::withMessages([
                'article_id' => 'O produto selecionado está inativo.',
            ]);
        }

        if (! $produto->visible_in_store) {
            throw ValidationException::withMessages([
                'article_id' => 'O produto selecionado nao esta disponivel na loja.',
            ]);
        }

        if ($variante && ! $variante->ativo) {
            throw ValidationException::withMessages([
                'product_variant_id' => 'A variante selecionada esta inativa.',
            ]);
        }

        if ($quantidade < 1) {
            throw ValidationException::withMessages([
                'quantidade' => 'A quantidade deve ser pelo menos 1.',
            ]);
        }

        if (! $produto->tracks_stock) {
            return;
        }

        $stockDisponivel = $this->availableStock($produto, $variante);

        if ($quantidade > $stockDisponivel) {
            throw ValidationException::withMessages([
                'quantidade' => 'Quantidade pedida superior ao stock disponível.',
            ]);
        }
    }

    public function availableStock(Product $produto, ?ProductVariant $variante = null): int
    {
        if (! $produto->tracks_stock) {
            return PHP_INT_MAX;
        }

        if ($variante) {
            return (int) $variante->available_stock;
        }

        return (int) $produto->available_stock;
    }

    public function unitPrice(Product $produto, ?ProductVariant $variante = null): float
    {
        return (float) $produto->sale_price + (float) ($variante?->preco_extra ?? 0);
    }

    public function decrement(Product $produto, ?ProductVariant $variante, int $quantidade): void
    {
        if (! $produto->tracks_stock) {
            return;
        }

        $this->ensureDisponivel($produto, $variante, $quantidade);

        if ($variante) {
            $variante->decrement('stock', $quantidade);
        }

        $produto->decrement('stock', $quantidade);
    }
}