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
        'mesociclo_id',
        'semana',
        'volume_previsto',
        'notas',
    ];

    public function mesocycle(): BelongsTo
    {
        return $this->belongsTo(Mesocycle::class, 'mesociclo_id');
    }

    public function trainings(): HasMany
    {
        return $this->hasMany(Training::class, 'microciclo_id');
    }
}
