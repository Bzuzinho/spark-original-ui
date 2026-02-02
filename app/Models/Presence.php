<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Presence extends Model
{
    use HasUuids;


    protected $fillable = [
        'athlete_id',
        'training_id',
        'date',
        'type',
        'present',
        'justification',
    ];

    protected $casts = [
        'date' => 'date',
        'present' => 'boolean',
    ];

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'athlete_id');
    }

    public function training(): BelongsTo
    {
        return $this->belongsTo(Training::class, 'training_id');
    }
}
