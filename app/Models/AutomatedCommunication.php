<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AutomatedCommunication extends Model
{
    use HasUuids;

    protected $table = 'automated_communications';

    protected $fillable = [
        'nome',
        'tipo_trigger',
        'tipo_comunicacao',
        'template_mensagem',
        'ativo',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];
}
