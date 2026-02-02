<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConvocationAthlete extends Model
{
    use HasUuids;

    protected $table = 'convocation_athletes';

    protected $fillable = [
        'convocation_group_id',
        'athlete_id',
        'races',
        'present',
        'confirmed',
    ];

    protected $casts = [
        'races' => 'array',
        'present' => 'boolean',
        'confirmed' => 'boolean',
    ];

    public function convocationGroup(): BelongsTo
    {
        return $this->belongsTo(ConvocationGroup::class, 'convocation_group_id');
    }

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'athlete_id');
    }
}
