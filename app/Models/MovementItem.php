<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovementItem extends Model
{
    use HasUuids;

    protected $table = 'movement_items';

    protected $fillable = [
        'movement_id',
        'description',
        'quantity',
        'unit_price',
        'total_amount',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function movement(): BelongsTo
    {
        return $this->belongsTo(Movement::class, 'movement_id');
    }

    public function centroCusto(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'cost_center_id');
    }
}
