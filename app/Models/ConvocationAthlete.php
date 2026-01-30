<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConvocationAthlete extends Model
{
    use HasUuids;

    protected $table = 'convocation_athletes';

    protected $fillable = [
        'convocatoria_grupo_id',
        'atleta_id',
        'provas',
        'presente',
        'confirmado',
        'data_confirmacao',
        'observacoes',
    ];

    protected $casts = [
        'provas' => 'array',
        'presente' => 'boolean',
        'confirmado' => 'boolean',
        'data_confirmacao' => 'datetime',
    ];

    public function convocationGroup(): BelongsTo
    {
        return $this->belongsTo(ConvocationGroup::class, 'convocatoria_grupo_id');
    }

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atleta_id');
    }
}
