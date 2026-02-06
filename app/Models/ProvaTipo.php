<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProvaTipo extends Model
{
    use HasUuids;

    protected $table = 'prova_tipos';

    protected $fillable = [
        'nome',
        'distancia',
        'unidade',
        'modalidade',
        'ativo',
    ];

    protected $casts = [
        'distancia' => 'integer',
        'ativo' => 'boolean',
    ];
}
