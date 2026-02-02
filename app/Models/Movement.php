<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Movement extends Model
{
    use HasUuids;


    protected $fillable = [
        'user_id',
        'manual_name',
        'manual_tax_id',
        'manual_address',
        'classification',
        'issue_date',
        'due_date',
        'total_amount',
        'payment_status',
        'receipt_number',
        'payment_reference',
        'type',
        'notes',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function centroCusto(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'cost_center_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(MovementItem::class, 'movement_id');
    }
}
