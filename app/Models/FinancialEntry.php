<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FinancialEntry extends Model
{
    use HasUuids;

    protected $table = 'financial_entries';

    protected $fillable = [
        'data',
        'tipo',
        'categoria',
        'descricao',
        'documento_ref',
        'valor',
        'centro_custo_id',
        'user_id',
        'fatura_id',
        'origem_tipo',
        'origem_id',
        'metodo_pagamento',
        'comprovativo',
    ];

    protected $casts = [
        'data' => 'date',
        'valor' => 'decimal:2',
    ];

    public function centroCusto(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'centro_custo_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function bankStatements(): HasMany
    {
        return $this->hasMany(BankStatement::class, 'lancamento_id');
    }
}
