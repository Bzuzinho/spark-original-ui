<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prova extends Model
{
    use HasUuids;


    protected $fillable = [
        'competition_id',
        'name',
        'distance',
        'stroke',
        'gender',
        'age_group',
        'datetime',
        'notes',
    ];

    protected $casts = [
        'distance' => 'integer',
        'datetime' => 'datetime',
    ];

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class, 'competition_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(CompetitionRegistration::class, 'competition_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class, 'race_id');
    }
}
