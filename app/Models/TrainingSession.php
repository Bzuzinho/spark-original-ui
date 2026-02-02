<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingSession extends Model
{
    use HasUuids;

    protected $fillable = [
        'team_id',
        'datetime',
        'duration_minutes',
        'location',
        'objectives',
        'status',
    ];

    protected $casts = [
        'datetime' => 'datetime',
        'duration_minutes' => 'integer',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
