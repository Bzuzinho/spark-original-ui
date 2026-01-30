<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventResult extends Model
{
    use HasUuids;

    protected $table = 'event_results';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'evento_id',
        'atleta_id',
        'prova',
        'tempo',
        'classificacao',
        'pontos',
        'escalao',
        'observacoes',
        'registado_por',
    ];

    protected $casts = [
        'classificacao' => 'integer',
        'pontos' => 'integer',
    ];

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'evento_id');
    }

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atleta_id');
    }

    public function registadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registado_por');
    }
}
