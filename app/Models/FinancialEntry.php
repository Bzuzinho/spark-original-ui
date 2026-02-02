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
        'date',
        'type',
        'category',
        'description',
        'amount',
        'invoice_id',
        'payment_method',
        'receipt',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function centroCusto(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'cost_center_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function bankStatements(): HasMany
    {
        return $this->hasMany(BankStatement::class, 'financial_entry_id');
    }
}
