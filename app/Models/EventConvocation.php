<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventConvocation extends Model
{
    use HasUuids;

    protected $table = 'event_convocations';

    protected $fillable = [
        'evento_id',
        'atleta_id',
        'data_convocatoria',
        'estado_confirmacao',
        'data_confirmacao',
        'transporte_clube',
        'observacoes',
        'convocado_por',
    ];

    protected $casts = [
        'data_convocatoria' => 'datetime',
        'data_confirmacao' => 'datetime',
        'transporte_clube' => 'boolean',
    ];

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'evento_id');
    }

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atleta_id');
    }

    public function convocadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'convocado_por');
    }
}
