<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConvocationMovement extends Model
{
    use HasUuids;

    protected $table = 'convocation_movements';

    protected $fillable = [
        'event_id',
        'convocation_group_id',
        'type',
        'description',
        'total_amount',
        'status',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    public function convocationGroup(): BelongsTo
    {
        return $this->belongsTo(ConvocationGroup::class, 'convocation_group_id');
    }

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ConvocationMovementItem::class, 'convocation_movement_id');
    }
}
