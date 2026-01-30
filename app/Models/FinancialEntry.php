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
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'data',
        'tipo',
        'categoria',
        'descricao',
        'valor',
        'metodo_pagamento',
        'centro_custo_id',
        'usuario_id',
        'documento_referencia',
        'observacoes',
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
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function bankStatements(): HasMany
    {
        return $this->hasMany(BankStatement::class, 'lancamento_id');
    }
}
