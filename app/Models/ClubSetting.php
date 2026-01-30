<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ClubSetting extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'nome_clube',
        'sigla',
        'morada',
        'codigo_postal',
        'localidade',
        'telefone',
        'email',
        'website',
        'nif',
        'logo_url',
        'horario_funcionamento',
        'redes_sociais',
        'iban',
    ];

    protected $casts = [
        'horario_funcionamento' => 'array',
        'redes_sociais' => 'array',
    ];
}
