<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingAthlete extends Model
{
    use HasUuids;

    protected $table = 'training_athletes';

    protected $fillable = [
        'treino_id',
        'atleta_id',
        'presente',
        'estado',
        'volume_real_m',
        'rpe',
        'feedback',
        'observacoes',
    ];

    protected $casts = [
        'presente' => 'boolean',
        'volume_real_m' => 'integer',
        'rpe' => 'integer',
    ];

    public function training(): BelongsTo
    {
        return $this->belongsTo(Training::class, 'treino_id');
    }

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atleta_id');
    }
}
