<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Season extends Model
{
    use HasUuids;


    protected $fillable = [
        'nome',
        'ano_temporada',
        'data_inicio',
        'data_fim',
        'tipo',
        'estado',
        'piscina_principal',
        'escaloes_abrangidos',
        'descricao',
        'provas_alvo',
        'volume_total_previsto',
        'volume_medio_semanal',
        'num_semanas_previsto',
        'num_competicoes_previstas',
        'objetivos_performance',
        'objetivos_tecnicos',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_fim' => 'date',
        'escaloes_abrangidos' => 'array',
        'provas_alvo' => 'array',
        'volume_total_previsto' => 'integer',
        'volume_medio_semanal' => 'integer',
        'num_semanas_previsto' => 'integer',
        'num_competicoes_previstas' => 'integer',
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
