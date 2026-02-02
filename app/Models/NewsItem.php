<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsItem extends Model
{
    use HasUuids;

    protected $table = 'news_items';

    protected $fillable = [
        'title',
        'content',
        'image',
        'publish_date',
        'author_id',
        'visibility',
        'status',
    ];

    protected $casts = [
        'publish_date' => 'datetime',
    ];

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
