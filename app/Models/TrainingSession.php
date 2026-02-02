<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingSession extends Model
{
    use HasUuids;

    protected $fillable = [
        'team_id',
        'data_hora',
        'duracao_minutos',
        'local',
        'objetivos',
        'estado',
    ];

    protected $casts = [
        'data_hora' => 'datetime',
        'duracao_minutos' => 'integer',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
