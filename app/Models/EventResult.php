<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventResult extends Model
{
    use HasUuids;

    protected $table = 'event_results';

    protected $fillable = [
        'evento_id',
        'user_id',
        'prova',
        'tempo',
        'classificacao',
        'piscina',
        'escalao',
        'observacoes',
        'epoca',
        'registado_por',
        'registado_em',
    ];

    protected $casts = [
        'classificacao' => 'integer',
        'registado_em' => 'datetime',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'evento_id');
    }

    public function athlete(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function registeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registado_por');
    }
}
