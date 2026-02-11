<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankStatement extends Model
{
    use HasUuids;

    protected $table = 'bank_statements';

    protected $fillable = [
        'conta',
        'data_movimento',
        'descricao',
        'valor',
        'saldo',
        'referencia',
        'ficheiro_id',
        'centro_custo_id',
        'conciliado',
        'lancamento_id',
    ];

    protected $casts = [
        'data_movimento' => 'date',
        'valor' => 'decimal:2',
        'saldo' => 'decimal:2',
        'conciliado' => 'boolean',
    ];

    public function centroCusto(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'centro_custo_id');
    }

    public function financialEntry(): BelongsTo
    {
        return $this->belongsTo(FinancialEntry::class, 'lancamento_id');
    }
}
