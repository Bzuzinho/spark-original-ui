<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class LojaProduto extends Model
{
    use HasUuids;

    protected $table = 'loja_produtos';

    protected $fillable = [
        'categoria_id',
        'codigo',
        'nome',
        'slug',
        'descricao',
        'preco',
        'imagem_principal_path',
        'ativo',
        'destaque',
        'gere_stock',
        'stock_atual',
        'stock_minimo',
        'ordem',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'ativo' => 'boolean',
        'destaque' => 'boolean',
        'gere_stock' => 'boolean',
        'stock_atual' => 'integer',
        'stock_minimo' => 'integer',
        'ordem' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $produto) {
            if (! $produto->slug) {
                $produto->slug = Str::slug($produto->nome ?: Str::random(8));
            }
        });
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('ativo', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('destaque', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderByRaw('COALESCE(ordem, 999999) asc')->orderBy('nome');
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(ItemCategory::class, 'categoria_id');
    }

    public function variantes(): HasMany
    {
        return $this->hasMany(LojaProdutoVariante::class, 'loja_produto_id');
    }

    public function carrinhoItens(): HasMany
    {
        return $this->hasMany(LojaCarrinhoItem::class, 'loja_produto_id');
    }

    public function encomendaItens(): HasMany
    {
        return $this->hasMany(LojaEncomendaItem::class, 'loja_produto_id');
    }

    public function heroItems(): HasMany
    {
        return $this->hasMany(LojaHeroItem::class, 'produto_id');
    }

    public function getStockDisponivelAttribute(): int
    {
        return (int) $this->stock_atual;
    }

    public function getTemStockBaixoAttribute(): bool
    {
        return $this->stock_minimo !== null && $this->stock_atual <= $this->stock_minimo;
    }
}