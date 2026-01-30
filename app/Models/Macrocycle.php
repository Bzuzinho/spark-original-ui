<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Macrocycle extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'epoca_id',
        'nome',
        'tipo',
        'data_inicio',
        'data_fim',
        'escalao',
        'objetivos',
        'observacoes',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_fim' => 'date',
    ];

    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class, 'epoca_id');
    }

    public function mesocycles(): HasMany
    {
        return $this->hasMany(Mesocycle::class, 'macrociclo_id');
    }
}
