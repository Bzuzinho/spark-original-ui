<?php

namespace App\Services\Loja;

use App\Models\LojaEncomenda;

class LojaFinanceiroService
{
    public function prepareForOrder(LojaEncomenda $encomenda): ?string
    {
        if ((float) $encomenda->total <= 0) {
            return null;
        }

        // Placeholder para futura integração com faturas/movimentos financeiros.
        return null;
    }
}