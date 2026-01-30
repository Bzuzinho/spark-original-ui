<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConvocationMovementItem extends Model
{
    use HasUuids;

    protected $table = 'convocation_movement_items';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'convocatoria_movimento_id',
        'descricao',
        'valor',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
    ];

    public function convocationMovement(): BelongsTo
    {
        return $this->belongsTo(ConvocationMovement::class, 'convocatoria_movimento_id');
    }
}
