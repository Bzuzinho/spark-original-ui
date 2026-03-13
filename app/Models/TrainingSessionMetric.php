<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingSessionMetric extends Model
{
    protected $table = 'training_session_metrics';

    protected $fillable = [
        'training_session_id',
        'user_id',
        'volume_m',
        'rpe',
        'zona_treino',
        'tipo_metrica',
        'valor',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(TrainingSession::class, 'training_session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
