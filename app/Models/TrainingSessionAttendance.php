<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingSessionAttendance extends Model
{
    protected $table = 'training_session_attendance';

    protected $fillable = [
        'training_session_id',
        'user_id',
        'presente',
        'estado',
        'volume_real_m',
        'rpe',
        'observacoes_tecnicas',
    ];

    protected $casts = [
        'presente' => 'boolean',
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
