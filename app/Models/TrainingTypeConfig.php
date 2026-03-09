<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Tipos de Treino (Configuração Desportiva)
 * 
 * Catálogo técnico para tipos/classificação de treinos
 * Ex: tecnico, resistencia, velocidade, forca, tapering, regeneracao, misto
 */
class TrainingTypeConfig extends Model
{
    use HasUuids;

    protected $table = 'training_type_configs';

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

    public function scopeAtivo($query)
    {
        return $query->where('ativo', true);
    }

    public function scopeOrdenado($query)
    {
        return $query->orderBy('ordem');
    }

    /**
     * Trainings usando este tipo
     */
    public function trainings(): HasMany
    {
        return $this->hasMany(Training::class, 'tipo_treino', 'codigo');
    }

    /**
     * Verifica se é tipo de regeneração/recovery
     */
    public function isRecovery(): bool
    {
        return in_array($this->codigo, ['regeneracao', 'tapering']);
    }

    /**
     * Verifica se é treino de alta intensidade
     */
    public function isHighIntensity(): bool
    {
        return in_array($this->codigo, ['velocidade', 'forca']);
    }
}
