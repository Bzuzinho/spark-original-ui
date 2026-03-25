<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ItemCategory extends Model
{
    use HasUuids;

    protected $table = 'item_categories';

    protected $fillable = [
        'codigo',
        'nome',
        'ativo',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];
}
