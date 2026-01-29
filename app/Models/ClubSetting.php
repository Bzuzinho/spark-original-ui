<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClubSetting extends Model
{
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
