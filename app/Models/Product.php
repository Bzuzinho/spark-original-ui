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
        'name',
        'description',
        'code',
        'category',
        'price',
        'minimum_stock',
        'image',
        'active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'minimum_stock' => 'integer',
        'active' => 'boolean',
    ];

    protected $appends = [
        'is_low_stock',
    ];

    // Accessor: is_low_stock
    public function getIsLowStockAttribute(): bool
    {
        return $this->stock <= $this->minimum_stock;
    }

    // Scope: active products
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('active', true);
    }

    // Scope: low stock products
    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn('stock', '<=', 'minimum_stock');
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'product_id');
    }
}
