<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventAttendance extends Model
{
    use HasUuids;

    protected $table = 'event_attendances';

    protected $fillable = [
        'event_id',
        'user_id',
        'status',
        'arrival_time',
        'notes',
        'registered_by',
        'registered_at',
    ];

    protected $casts = [
        'arrival_time' => 'datetime',
        'registered_at' => 'datetime',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
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
