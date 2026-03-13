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

    public function macrocycle(): BelongsTo
    {
        if (array_key_exists('macrocycle_id', $this->attributes)) {
            return $this->belongsTo(Macrocycle::class, 'macrocycle_id');
        }

        return $this->belongsTo(Macrocycle::class, 'macrociclo_id');
    }

    public function mesocycle(): BelongsTo
    {
        if (array_key_exists('mesocycle_id', $this->attributes)) {
            return $this->belongsTo(Mesocycle::class, 'mesocycle_id');
        }

        return $this->belongsTo(Mesocycle::class, 'mesociclo_id');
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

    public function athleteRecordsByTrainingId(): HasMany
    {
        return $this->hasMany(TrainingAthlete::class, 'training_id');
    }

    public function ageGroups(): BelongsToMany
    {
        return $this->belongsToMany(AgeGroup::class, 'training_age_group', 'treino_id', 'age_group_id')
            ->withTimestamps();
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(TrainingMetric::class, 'treino_id');
    }
}
