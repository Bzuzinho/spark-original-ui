<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Season extends Model
{
    use HasUuids;


    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'active' => 'boolean',
    ];

    public function macrocycles(): HasMany
    {
        return $this->hasMany(Macrocycle::class, 'season_id');
    }

    public function trainings(): HasMany
    {
        return $this->hasMany(Training::class, 'season_id');
    }
}
