<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConvocationGroup extends Model
{
    use HasUuids;

    protected $table = 'convocation_groups';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'evento_id',
        'criado_por',
        'data_criacao',
        'atletas_ids',
        'tipo_custo',
        'valor_por_salto',
        'valor_estafeta',
    ];

    protected $casts = [
        'data_criacao' => 'datetime',
        'atletas_ids' => 'array',
        'valor_por_salto' => 'decimal:2',
        'valor_estafeta' => 'decimal:2',
    ];

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'evento_id');
    }

    public function criadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criado_por');
    }

    public function convocationAthletes(): HasMany
    {
        return $this->hasMany(ConvocationAthlete::class, 'convocatoria_grupo_id');
    }

    public function convocationMovements(): HasMany
    {
        return $this->hasMany(ConvocationMovement::class, 'convocatoria_grupo_id');
    }
}
