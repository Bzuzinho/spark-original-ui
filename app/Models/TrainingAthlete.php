<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingAthlete extends Model
{
    use HasUuids;

    protected $table = 'training_athletes';

    protected $fillable = [
        'training_id',
        'athlete_id',
        'present',
        'notes',
    ];

    protected $casts = [
        'present' => 'boolean',
    ];

    public function training(): BelongsTo
    {
        return $this->belongsTo(Training::class, 'training_id');
    }

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'athlete_id');
    }
}
