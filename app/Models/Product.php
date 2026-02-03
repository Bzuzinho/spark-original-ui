<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Product extends Model
{
    use HasUuids;

    protected $fillable = [
        'nome',
        'descricao',
        'codigo',
        'categoria',
        'preco',
        'stock_minimo',
        'imagem',
        'ativo',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'stock' => 'integer',
        'stock_minimo' => 'integer',
        'ativo' => 'boolean',
    ];

    protected $appends = [
        'is_low_stock',
    ];

    // Accessor: is_low_stock
    public function getIsLowStockAttribute(): bool
    {
        return $this->stock <= $this->stock_minimo;
    }

    // Scope: active products
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('ativo', true);
    }

    // Scope: low stock products
    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn('stock', '<=', 'stock_minimo');
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'product_id');
    }
}
