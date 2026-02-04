<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class EventType extends Model
{
    use HasUuids;


    protected $fillable = [
        'nome',
        'descricao',
        'categoria',
        'cor',
        'ativo',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];
}
