<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Communication extends Model
{
    use HasUuids;


    protected $fillable = [
        'titulo',
        'mensagem',
        'tipo',
        'destinatarios_ids',
        'remetente_id',
        'data_envio',
        'estado',
    ];

    protected $casts = [
        'destinatarios_ids' => 'array',
        'data_envio' => 'datetime',
    ];

    public function remetente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'remetente_id');
    }
}
