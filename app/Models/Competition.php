<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Competition extends Model
{
    use HasUuids;


    protected $fillable = [
        'nome',
        'local',
        'data_inicio',
        'data_fim',
        'tipo',
        'evento_id',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_fim' => 'date',
    ];

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'evento_id');
    }

    public function provas(): HasMany
    {
        return $this->hasMany(Prova::class, 'competicao_id');
    }

    public function results(): HasManyThrough
    {
        return $this->hasManyThrough(
            Result::class,
            Prova::class,
            'competicao_id',
            'prova_id',
            'id',
            'id'
        );
    }

    public function teamResults(): HasMany
    {
        return $this->hasMany(TeamResult::class, 'competicao_id');
    }
}
