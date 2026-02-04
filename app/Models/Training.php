<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Training extends Model
{
    use HasUuids;


    protected $fillable = [
        'numero_treino',
        'data',
        'hora_inicio',
        'hora_fim',
        'local',
        'epoca_id',
        'microciclo_id',
        'grupo_escalao_id',
        'escaloes',
        'tipo_treino',
        'volume_planeado_m',
        'notas_gerais',
        'descricao_treino',
        'criado_por',
        'evento_id',
        'atualizado_em',
    ];

    protected $casts = [
        'data' => 'date',
        'escaloes' => 'array',
        'volume_planeado_m' => 'integer',
        'atualizado_em' => 'datetime',
    ];

    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class, 'epoca_id');
    }

    public function microcycle(): BelongsTo
    {
        return $this->belongsTo(Microcycle::class, 'microciclo_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criado_por');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'evento_id');
    }

    public function series(): HasMany
    {
        return $this->hasMany(TrainingSeries::class, 'treino_id');
    }

    public function athletes()
    {
        return $this->belongsToMany(
            User::class,
            'training_athletes',
            'treino_id',
            'user_id'
        )->withTimestamps()
         ->withPivot(['presente', 'estado', 'volume_real_m', 'rpe', 'observacoes_tecnicas', 'registado_por', 'registado_em']);
    }

    public function athleteRecords(): HasMany
    {
        return $this->hasMany(TrainingAthlete::class, 'treino_id');
    }

    public function presences(): HasMany
    {
        return $this->hasMany(Presence::class, 'treino_id');
    }
}
