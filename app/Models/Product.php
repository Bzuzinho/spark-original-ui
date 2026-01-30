<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'nome',
        'descricao',
        'imagem',
        'categoria',
        'preco',
        'stock',
        'ativo',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'stock' => 'integer',
        'ativo' => 'boolean',
    ];

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'produto_id');
    }
}
