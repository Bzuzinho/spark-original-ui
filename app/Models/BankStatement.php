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
        'date',
        'description',
        'amount',
        'balance',
        'type',
        'category',
        'reconciled',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'balance' => 'decimal:2',
        'reconciled' => 'boolean',
    ];

    public function centroCusto(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'cost_center_id');
    }

    public function financialEntry(): BelongsTo
    {
        return $this->belongsTo(FinancialEntry::class, 'financial_entry_id');
    }
}
