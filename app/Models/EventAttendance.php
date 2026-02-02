<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventAttendance extends Model
{
    use HasUuids;

    protected $table = 'event_attendances';

    protected $fillable = [
        'evento_id',
        'user_id',
        'estado',
        'hora_chegada',
        'observacoes',
        'registado_por',
        'registado_em',
    ];

    protected $casts = [
        'hora_chegada' => 'datetime',
        'registado_em' => 'datetime',
    ];

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'evento_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function registadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registado_por');
    }
}
