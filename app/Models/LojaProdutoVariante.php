<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LojaProdutoVariante extends Model
{
    use HasUuids;

    protected $table = 'loja_produto_variantes';

    protected $fillable = [
        'loja_produto_id',
        'nome',
        'tamanho',
        'cor',
        'sku',
        'preco_extra',
        'stock_atual',
        'ativo',
    ];

    protected $casts = [
        'preco_extra' => 'decimal:2',
        'stock_atual' => 'integer',
        'ativo' => 'boolean',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('ativo', true);
    }

    public function produto(): BelongsTo
    {
        return $this->belongsTo(LojaProduto::class, 'loja_produto_id');
    }

    public function carrinhoItens(): HasMany
    {
        return $this->hasMany(LojaCarrinhoItem::class, 'loja_produto_variante_id');
    }

    public function encomendaItens(): HasMany
    {
        return $this->hasMany(LojaEncomendaItem::class, 'loja_produto_variante_id');
    }

    public function getEtiquetaAttribute(): string
    {
        return collect([$this->nome, $this->tamanho, $this->cor])
            ->filter(fn (?string $value) => filled($value))
            ->implode(' / ');
    }
}