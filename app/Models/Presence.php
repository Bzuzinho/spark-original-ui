<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Presence extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'atleta_id',
        'treino_id',
        'data',
        'tipo',
        'presente',
        'justificacao',
        'observacoes',
    ];

    protected $casts = [
        'data' => 'date',
        'presente' => 'boolean',
    ];

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atleta_id');
    }

    public function training(): BelongsTo
    {
        return $this->belongsTo(Training::class, 'treino_id');
    }
}
