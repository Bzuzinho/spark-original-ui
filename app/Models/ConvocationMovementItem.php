<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConvocationMovementItem extends Model
{
    use HasUuids;

    protected $table = 'convocation_movement_items';

    protected $fillable = [
        'convocation_movement_id',
        'description',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function convocationMovement(): BelongsTo
    {
        return $this->belongsTo(ConvocationMovement::class, 'convocation_movement_id');
    }
}
