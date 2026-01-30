<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovementItem extends Model
{
    use HasUuids;

    protected $table = 'movement_items';

    protected $fillable = [
        'movimento_id',
        'descricao',
        'valor_unitario',
        'quantidade',
        'total_linha',
        'centro_custo_id',
    ];

    protected $casts = [
        'valor_unitario' => 'decimal:2',
        'quantidade' => 'integer',
        'total_linha' => 'decimal:2',
    ];

    public function movement(): BelongsTo
    {
        return $this->belongsTo(Movement::class, 'movimento_id');
    }

    public function centroCusto(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'centro_custo_id');
    }
}
