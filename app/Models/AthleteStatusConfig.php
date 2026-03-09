<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Estados de Atleta (Configuração Desportiva)
 * 
 * Catálogo técnico para estados de presença/participação de atletas em treinos
 * Ex: presente, ausente, justificado, lesionado, limitado, doente
 */
class AthleteStatusConfig extends Model
{
    use HasUuids;

    protected $table = 'athlete_status_configs';

    protected $fillable = [
        'codigo',
        'nome',
        'nome_en',
        'descricao',
        'cor',
        'ativo',
        'ordem',
    ];

    protected $casts = [
        'ativo' => 'boolean',
        'ordem' => 'integer',
    ];

    /**
     * Scope para obter apenas estados ativos
     */
    public function scopeAtivo($query)
    {
        return $query->where('ativo', true);
    }

    /**
     * Scope para ordenar por ordem definida
     */
    public function scopeOrdenado($query)
    {
        return $query->orderBy('ordem');
    }

    /**
     * Training athletes usando este estado
     */
    public function trainingAthletes(): HasMany
    {
        return $this->hasMany(TrainingAthlete::class, 'estado', 'codigo');
    }

    /**
     * Verifica se estado indica presença
     */
    public function isPresente(): bool
    {
        return in_array($this->codigo, ['presente', 'limitado']);
    }

    /**
     * Verifica se requer justificação
     */
    public function requerJustificacao(): bool
    {
        return in_array($this->codigo, ['justificado', 'lesionado', 'doente']);
    }
}
