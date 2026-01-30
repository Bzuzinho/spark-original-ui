<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Sponsor extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'nome',
        'logo',
        'tipo',
        'contrato_inicio',
        'contrato_fim',
        'valor_anual',
        'contacto_nome',
        'contacto_email',
        'contacto_telefone',
        'observacoes',
        'ativo',
    ];

    protected $casts = [
        'contrato_inicio' => 'date',
        'contrato_fim' => 'date',
        'valor_anual' => 'decimal:2',
        'ativo' => 'boolean',
    ];
}
