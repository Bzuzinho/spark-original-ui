<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConvocationMovement extends Model
{
    use HasUuids;

    protected $table = 'convocation_movements';

    protected $fillable = [
        'user_id',
        'convocatoria_grupo_id',
        'evento_id',
        'evento_nome',
        'tipo',
        'data_emissao',
        'valor',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'data_emissao' => 'date',
    ];

    public function convocationGroup(): BelongsTo
    {
        return $this->belongsTo(ConvocationGroup::class, 'convocatoria_grupo_id');
    }

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'evento_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ConvocationMovementItem::class, 'convocation_movement_id');
    }
}
