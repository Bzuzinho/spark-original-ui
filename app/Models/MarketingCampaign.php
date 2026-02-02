<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class MarketingCampaign extends Model
{
    use HasUuids;

    protected $fillable = [
        'nome',
        'descricao',
        'tipo',
        'data_inicio',
        'data_fim',
        'estado',
        'orcamento',
        'alcance_estimado',
        'notas',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_fim' => 'date',
        'orcamento' => 'decimal:2',
        'alcance_estimado' => 'integer',
    ];

    /**
     * Scope to filter active campaigns
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('estado', 'ativa');
    }

    /**
     * Scope to filter completed campaigns
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('estado', 'concluida');
    }

    /**
     * Scope to filter by type
     */
    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('tipo', $type);
    }

    /**
     * Scope to filter by status
     */
    public function scopeOfStatus(Builder $query, string $status): Builder
    {
        return $query->where('estado', $status);
    }

    /**
     * Scope to search campaigns
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('nome', 'like', "%{$search}%")
              ->orWhere('descricao', 'like', "%{$search}%")
              ->orWhere('notas', 'like', "%{$search}%");
        });
    }
}
