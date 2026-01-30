<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsItem extends Model
{
    use HasUuids;

    protected $table = 'news_items';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'titulo',
        'conteudo',
        'imagem',
        'destaque',
        'data_publicacao',
        'categorias',
        'autor_id',
    ];

    protected $casts = [
        'data_publicacao' => 'datetime',
        'destaque' => 'boolean',
        'categorias' => 'array',
    ];

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'autor_id');
    }
}
