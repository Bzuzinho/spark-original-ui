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
        'competicao_id',
        'estilo',
        'distancia_m',
        'genero',
        'escalao_id',
        'ordem_prova',
    ];

    protected $casts = [
        'distancia_m' => 'integer',
        'ordem_prova' => 'integer',
    ];

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class, 'competicao_id');
    }

    public function ageGroup(): BelongsTo
    {
        return $this->belongsTo(AgeGroup::class, 'escalao_id');
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
