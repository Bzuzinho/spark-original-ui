<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Macrocycle extends Model
{
    use HasUuids;


    protected $fillable = [
        'season_id',
        'name',
        'start_date',
        'end_date',
        'objective',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class, 'season_id');
    }

    public function mesocycles(): HasMany
    {
        return $this->hasMany(Mesocycle::class, 'macrocycle_id');
    }
}
