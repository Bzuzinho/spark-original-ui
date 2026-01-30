<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Season extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'nome',
        'ano_temporada',
        'data_inicio',
        'data_fim',
        'tipo',
        'estado',
        'piscina_principal',
        'objetivos',
        'observacoes',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_fim' => 'date',
    ];

    public function macrocycles(): HasMany
    {
        return $this->hasMany(Macrocycle::class, 'epoca_id');
    }

    public function trainings(): HasMany
    {
        return $this->hasMany(Training::class, 'epoca_id');
    }
}
