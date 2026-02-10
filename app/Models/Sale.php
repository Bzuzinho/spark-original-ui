<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\FinancialEntry;

class Sale extends Model
{
    use HasUuids;


    protected $fillable = [
        'produto_id',
        'cliente_id',
        'vendedor_id',
        'quantidade',
        'preco_unitario',
        'total',
        'data',
        'metodo_pagamento',
    ];

    protected $casts = [
        'quantidade' => 'integer',
        'preco_unitario' => 'decimal:2',
        'total' => 'decimal:2',
        'data' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::created(function (Sale $sale) {
            $product = $sale->product()->first();
            if ($product) {
                $product->decrement('stock', $sale->quantidade);
            }

            if (!$sale->cliente_id) {
                return;
            }

            $valor = $sale->total ?? ($sale->preco_unitario * $sale->quantidade);
            $emissao = $sale->data ? Carbon::parse($sale->data) : Carbon::now();
            $vencimento = self::addBusinessDays($emissao->copy(), 8);

            $invoice = Invoice::create([
                'user_id' => $sale->cliente_id,
                'data_fatura' => $emissao->toDateString(),
                'mes' => $emissao->format('Y-m'),
                'data_emissao' => $emissao->toDateString(),
                'data_vencimento' => $vencimento->toDateString(),
                'valor_total' => $valor,
                'oculta' => false,
                'estado_pagamento' => 'pendente',
                'centro_custo_id' => null,
                'tipo' => 'material',
                'origem_tipo' => 'stock',
                'origem_id' => $sale->id,
                'observacoes' => $product?->nome ? "Venda de material: {$product->nome}" : 'Venda de material',
            ]);

            InvoiceItem::create([
                'fatura_id' => $invoice->id,
                'descricao' => $product?->nome ? "Venda de material: {$product->nome}" : 'Venda de material',
                'valor_unitario' => $sale->preco_unitario,
                'quantidade' => $sale->quantidade,
                'imposto_percentual' => 0,
                'total_linha' => $valor,
                'produto_id' => $sale->produto_id,
            ]);

            FinancialEntry::create([
                'data' => $emissao->toDateString(),
                'tipo' => 'receita',
                'categoria' => 'Venda de material',
                'descricao' => $product?->nome ? "Venda de material: {$product->nome}" : 'Venda de material',
                'valor' => $valor,
                'centro_custo_id' => null,
                'user_id' => $sale->cliente_id,
                'fatura_id' => $invoice->id,
                'origem_tipo' => 'stock',
                'origem_id' => $sale->id,
                'metodo_pagamento' => $sale->metodo_pagamento,
            ]);
        });
    }

    private static function addBusinessDays(Carbon $date, int $days): Carbon
    {
        $added = 0;
        while ($added < $days) {
            $date->addDay();
            if ($date->isWeekend()) {
                continue;
            }
            $added += 1;
        }

        return $date;
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'produto_id');
    }

    public function comprador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function vendedor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendedor_id');
    }
}
