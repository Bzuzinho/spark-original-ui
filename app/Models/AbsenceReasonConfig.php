<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * Motivos de Ausência (Configuração Desportiva)
 * 
 * Catálogo técnico para motivos de ausência de atletas
 * Ex: doenca, lesao, trabalho, estudos, familia, transporte, outros
 */
class AbsenceReasonConfig extends Model
{
    use HasUuids;

    protected $table = 'absence_reason_configs';

    protected $fillable = [
        'codigo',
        'nome',
        'nome_en',
        'descricao',
        'requer_justificacao',
        'ativo',
        'ordem',
    ];

    protected $casts = [
        'requer_justificacao' => 'boolean',
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
     * Scope para motivos que requerem justificação
     */
    public function scopeRequerJustificacao($query)
    {
        return $query->where('requer_justificacao', true);
    }

    /**
     * Verifica se é motivo relacionado a saúde
     */
    public function isHealthRelated(): bool
    {
        return in_array($this->codigo, ['doenca', 'lesao']);
    }
}
