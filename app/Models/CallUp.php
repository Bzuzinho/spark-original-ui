<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CallUp extends Model
{
    use HasUuids;

    protected $fillable = [
        'event_id',
        'team_id',
        'atletas_convocados',
        'presencas',
        'observacoes',
    ];

    protected $casts = [
        'atletas_convocados' => 'array',
        'presencas' => 'array',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
