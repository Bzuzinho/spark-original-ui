<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Microcycle extends Model
{
    use HasUuids;


    protected $fillable = [
        'mesocycle_id',
        'name',
        'start_date',
        'end_date',
        'type',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function mesocycle(): BelongsTo
    {
        return $this->belongsTo(Mesocycle::class, 'mesocycle_id');
    }

    public function trainings(): HasMany
    {
        return $this->hasMany(Training::class, 'microcycle_id');
    }
}
