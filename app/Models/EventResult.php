<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventResult extends Model
{
    use HasUuids;

    protected $table = 'event_results';

    protected $fillable = [
        'event_id',
        'user_id',
        'race',
        'time',
        'classification',
        'pool',
        'age_group',
        'notes',
        'season',
        'registered_by',
        'registered_at',
    ];

    protected $casts = [
        'classification' => 'integer',
        'registered_at' => 'datetime',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function athlete(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function registeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registered_by');
    }
}
