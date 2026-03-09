<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * Tipos de Piscina (Configuração Desportiva)
 * 
 * Catálogo técnico para tipos de piscina/local de treino
 * Ex: piscina_25m, piscina_50m, mar_aberto, lago, rio
 */
class PoolTypeConfig extends Model
{
    use HasUuids;

    protected $table = 'pool_type_configs';

    protected $fillable = [
        'codigo',
        'nome',
        'comprimento_m',
        'ativo',
        'ordem',
    ];

    protected $casts = [
        'comprimento_m' => 'integer',
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
     * Scope para piscinas com comprimento definido
     */
    public function scopeComComprimento($query)
    {
        return $query->whereNotNull('comprimento_m');
    }

    /**
     * Verifica se é piscina olímpica (50m)
     */
    public function isOlimpica(): bool
    {
        return $this->comprimento_m === 50;
    }

    /**
     * Verifica se é piscina curta (25m)
     */
    public function isPiscinaCurta(): bool
    {
        return $this->comprimento_m === 25;
    }

    /**
     * Verifica se é água aberta (mar, lago, rio)
     */
    public function isAguaAberta(): bool
    {
        return is_null($this->comprimento_m);
    }

    /**
     * Calcula número de voltas para distância específica
     */
    public function calcularVoltasParaDistancia(int $distanciaMetros): ?int
    {
        if (!$this->comprimento_m) {
            return null; // Água aberta não tem voltas
        }

        return (int) ceil($distanciaMetros / $this->comprimento_m);
    }
}
