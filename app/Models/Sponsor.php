<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
               ($this->data_fim === null || $this->data_fim->isFuture());
    }
}
