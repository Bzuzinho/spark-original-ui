<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Presence extends Model
{
    use HasUuids;


    protected $fillable = [
        'user_id',
        'data',
        'treino_id',
        'tipo',
        'justificacao',
        'presente',
    ];

    protected $casts = [
        'data' => 'date',
        'presente' => 'boolean',
    ];

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function training(): BelongsTo
    {
        return $this->belongsTo(Training::class, 'treino_id');
    }
}
