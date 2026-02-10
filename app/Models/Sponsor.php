<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use App\Models\Movement;
use App\Models\MovementItem;
use App\Models\FinancialEntry;

class Sponsor extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'nome',
        'descricao',
        'logo',
        'website',
        'contacto',
        'email',
        'tipo',
        'valor_anual',
        'data_inicio',
        'data_fim',
        'estado',
    ];

    protected $casts = [
        'valor_anual' => 'decimal:2',
        'data_inicio' => 'date',
        'data_fim' => 'date',
    ];

    protected static function booted(): void
    {
        static::created(function (Sponsor $sponsor) {
            $valor = $sponsor->valor_anual ?? 0;
            $emissao = $sponsor->data_inicio ? Carbon::parse($sponsor->data_inicio) : Carbon::now();

            $movement = Movement::create([
                'user_id' => null,
                'nome_manual' => $sponsor->nome,
                'nif_manual' => null,
                'morada_manual' => null,
                'classificacao' => 'receita',
                'data_emissao' => $emissao->toDateString(),
                'data_vencimento' => $emissao->toDateString(),
                'valor_total' => $valor,
                'estado_pagamento' => 'pago',
                'centro_custo_id' => null,
                'tipo' => 'patrocinio',
                'origem_tipo' => 'patrocinio',
                'origem_id' => $sponsor->id,
                'observacoes' => $sponsor->descricao ? "Patrocinio: {$sponsor->descricao}" : 'Patrocinio',
            ]);

            MovementItem::create([
                'movimento_id' => $movement->id,
                'descricao' => "Patrocinio - {$sponsor->nome}",
                'valor_unitario' => $valor,
                'quantidade' => 1,
                'imposto_percentual' => 0,
                'total_linha' => $valor,
            ]);

            if ($valor > 0) {
                FinancialEntry::create([
                    'data' => $emissao->toDateString(),
                    'tipo' => 'receita',
                    'categoria' => 'Patrocinio',
                    'descricao' => "Patrocinio - {$sponsor->nome}",
                    'valor' => $valor,
                    'centro_custo_id' => null,
                    'user_id' => null,
                    'fatura_id' => null,
                    'origem_tipo' => 'patrocinio',
                    'origem_id' => $sponsor->id,
                    'metodo_pagamento' => 'transferencia',
                ]);
            }
        });
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('estado', 'ativo');
    }

    public function scopeExpired($query)
    {
        return $query->where('estado', 'expirado')
                     ->orWhere(function($q) {
                         $q->whereNotNull('data_fim')
                           ->where('data_fim', '<', now());
                     });
    }

    // Accessor
    public function getIsActiveAttribute(): bool
    {
        return $this->estado === 'ativo' && 
               ($this->data_fim === null || $this->data_fim > now());
    }
}
