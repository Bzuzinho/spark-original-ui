<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'stock',
        'stock_reservado',
        'stock_minimo',
        'area_armazenamento',
        'supplier_id',
        'imagem',
        'ativo',
        'visible_in_store',
        'variant_options',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'stock' => 'integer',
        'stock_reservado' => 'integer',
        'stock_minimo' => 'integer',
        'ativo' => 'boolean',
        'visible_in_store' => 'boolean',
        'variant_options' => 'array',
    ];

    protected $appends = [
        'is_low_stock',
        'available_stock',
    ];

    // Accessor: is_low_stock
    public function getIsLowStockAttribute(): bool
    {
        return $this->available_stock <= $this->stock_minimo;
    }

    public function getAvailableStockAttribute(): int
    {
        return (int) $this->stock - (int) ($this->stock_reservado ?? 0);
    }

    // Scope: active products
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('ativo', true);
    }

    public function scopeVisibleInStore(Builder $query): Builder
    {
        return $query->where('visible_in_store', true);
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

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'article_id');
    }

    public function sponsorshipGoodsItems(): HasMany
    {
        return $this->hasMany(SponsorshipGoodsItem::class, 'item_id');
    }
}
