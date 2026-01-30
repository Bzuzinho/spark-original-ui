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
        'macrociclo_id',
        'nome',
        'foco',
        'data_inicio',
        'data_fim',
        'objetivos',
        'observacoes',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_fim' => 'date',
    ];

    public function macrocycle(): BelongsTo
    {
        return $this->belongsTo(Macrocycle::class, 'macrociclo_id');
    }

    public function microcycles(): HasMany
    {
        return $this->hasMany(Microcycle::class, 'mesociclo_id');
    }
}
