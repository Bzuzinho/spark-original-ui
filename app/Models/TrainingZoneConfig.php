<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * Zonas de Treino (Configuração Desportiva)
 * 
 * Catálogo técnico para zonas de intensidade de treino
 * Ex: Z1 (Recuperação), Z2 (Aeróbica Base), Z3 (Aeróbica Intensiva), 
 *     Z4 (Limiar Anaeróbico), Z5 (VO2 Max), Z6 (Velocidade Máxima)
 */
class TrainingZoneConfig extends Model
{
    use HasUuids;

    protected $table = 'training_zone_configs';

    protected $fillable = [
        'codigo',
        'nome',
        'descricao',
        'percentagem_min',
        'percentagem_max',
        'cor',
        'ativo',
        'ordem',
    ];

    protected $casts = [
        'percentagem_min' => 'integer',
        'percentagem_max' => 'integer',
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
     * Determina zona com base em percentagem de FC
     */
    public static function getZonaPorPercentagem(int $percentagem): ?self
    {
        return self::ativo()
            ->where('percentagem_min', '<=', $percentagem)
            ->where('percentagem_max', '>=', $percentagem)
            ->first();
    }

    /**
     * Verifica se é zona de recuperação
     */
    public function isRecoveryZone(): bool
    {
        return $this->percentagem_max <= 70;
    }

    /**
     * Verifica se é zona de alta intensidade
     */
    public function isHighIntensityZone(): bool
    {
        return $this->percentagem_min >= 80;
    }
}
