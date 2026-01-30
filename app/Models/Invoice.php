<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasUuids;


    protected $fillable = [
        'socio_id',
        'data_fatura',
        'mes',
        'ano',
        'valor_total',
        'valor_pago',
        'estado_pagamento',
        'data_pagamento',
        'metodo_pagamento',
        'numero_recibo',
        'centro_custo_id',
        'observacoes',
    ];

    protected $casts = [
        'data_fatura' => 'date',
        'data_pagamento' => 'date',
        'valor_total' => 'decimal:2',
        'valor_pago' => 'decimal:2',
        'ano' => 'integer',
    ];

    public function socio(): BelongsTo
    {
        return $this->belongsTo(User::class, 'socio_id');
    }

    public function centroCusto(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'centro_custo_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class, 'fatura_id');
    }
}
