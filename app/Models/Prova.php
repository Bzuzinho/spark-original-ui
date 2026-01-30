<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prova extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'competicao_id',
        'estilo',
        'distancia_m',
        'genero',
        'escalao_id',
        'ordem_prova',
        'data_hora',
        'observacoes',
    ];

    protected $casts = [
        'distancia_m' => 'integer',
        'ordem_prova' => 'integer',
        'data_hora' => 'datetime',
    ];

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class, 'competicao_id');
    }

    public function escalao(): BelongsTo
    {
        return $this->belongsTo(AgeGroup::class, 'escalao_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(CompetitionRegistration::class, 'prova_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class, 'prova_id');
    }
}
