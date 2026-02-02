<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mesocycle extends Model
{
    use HasUuids;


    protected $fillable = [
        'macrocycle_id',
        'name',
        'start_date',
        'end_date',
        'type',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function macrocycle(): BelongsTo
    {
        return $this->belongsTo(Macrocycle::class, 'macrocycle_id');
    }

    public function microcycles(): HasMany
    {
        return $this->hasMany(Microcycle::class, 'mesocycle_id');
    }
}
