<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventConvocation extends Model
{
    use HasUuids;

    protected $table = 'event_convocations';

    protected $fillable = [
        'event_id',
        'user_id',
        'convocation_date',
        'confirmation_status',
        'response_date',
        'justification',
        'club_transport',
        'notes',
    ];

    protected $casts = [
        'convocation_date' => 'date',
        'response_date' => 'datetime',
        'club_transport' => 'boolean',
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
}
