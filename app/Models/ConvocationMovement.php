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
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'atleta_id',
        'convocatoria_grupo_id',
        'evento_id',
        'tipo',
        'data_emissao',
        'valor',
        'estado',
        'observacoes',
    ];

    protected $casts = [
        'data_emissao' => 'date',
        'valor' => 'decimal:2',
    ];

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atleta_id');
    }

    public function convocationGroup(): BelongsTo
    {
        return $this->belongsTo(ConvocationGroup::class, 'convocatoria_grupo_id');
    }

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'evento_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ConvocationMovementItem::class, 'convocatoria_movimento_id');
    }
}
