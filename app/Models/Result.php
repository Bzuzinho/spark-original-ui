<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Result extends Model
{
    use HasUuids;


    protected $fillable = [
        'race_id',
        'athlete_id',
        'official_time',
        'reaction_time',
        'position',
        'fina_points',
        'disqualified',
        'notes',
    ];

    protected $casts = [
        'position' => 'integer',
        'fina_points' => 'integer',
        'disqualified' => 'boolean',
    ];

    public function prova(): BelongsTo
    {
        return $this->belongsTo(Prova::class, 'race_id');
    }

    public function athlete(): BelongsTo
    {
        return $this->belongsTo(User::class, 'athlete_id');
    }

    public function splits(): HasMany
    {
        return $this->hasMany(ResultSplit::class, 'result_id');
    }
}
