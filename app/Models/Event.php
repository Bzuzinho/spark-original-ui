<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'titulo',
        'descricao',
        'data_inicio',
        'hora_inicio',
        'data_fim',
        'hora_fim',
        'local',
        'local_detalhes',
        'tipo',
        'tipo_config_id',
        'tipo_piscina',
        'visibilidade',
        'escaloes_elegiveis',
        'transporte_necessario',
        'transporte_detalhes',
        'hora_partida',
        'local_partida',
        'taxa_inscricao',
        'custo_inscricao_por_prova',
        'custo_inscricao_por_salto',
        'custo_inscricao_estafeta',
        'centro_custo_id',
        'observacoes',
        'convocatoria_ficheiro',
        'regulamento_ficheiro',
        'estado',
        'criado_por',
        'recorrente',
        'recorrencia_data_inicio',
        'recorrencia_data_fim',
        'recorrencia_dias_semana',
        'evento_pai_id',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_fim' => 'date',
        'transporte_necessario' => 'boolean',
        'recorrente' => 'boolean',
        'recorrencia_data_inicio' => 'date',
        'recorrencia_data_fim' => 'date',
        'escaloes_elegiveis' => 'array',
        'recorrencia_dias_semana' => 'array',
        'taxa_inscricao' => 'decimal:2',
        'custo_inscricao_por_prova' => 'decimal:2',
        'custo_inscricao_por_salto' => 'decimal:2',
        'custo_inscricao_estafeta' => 'decimal:2',
    ];

    public function tipoConfig(): BelongsTo
    {
        return $this->belongsTo(EventTypeConfig::class, 'tipo_config_id');
    }

    public function centroCusto(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'centro_custo_id');
    }

    public function criador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criado_por');
    }

    public function eventoPai(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'evento_pai_id');
    }

    public function eventosFilhos(): HasMany
    {
        return $this->hasMany(Event::class, 'evento_pai_id');
    }

    public function convocations(): HasMany
    {
        return $this->hasMany(EventConvocation::class, 'evento_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(EventAttendance::class, 'evento_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(EventResult::class, 'evento_id');
    }

    public function trainings(): HasMany
    {
        return $this->hasMany(Training::class, 'evento_id');
    }

    public function competition(): HasMany
    {
        return $this->hasMany(Competition::class, 'evento_id');
    }

    public function convocationGroups(): HasMany
    {
        return $this->hasMany(ConvocationGroup::class, 'evento_id');
    }

    public function convocationMovements(): HasMany
    {
        return $this->hasMany(ConvocationMovement::class, 'evento_id');
    }
}
