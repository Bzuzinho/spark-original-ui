<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingSeries extends Model
{
    use HasUuids;

    protected $table = 'training_series';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'treino_id',
        'ordem',
        'descricao',
        'distancia_m',
        'estilo',
        'zona_intensidade',
        'tempo_alvo',
        'repeticoes',
        'intervalo_descanso',
        'equipamento',
        'observacoes',
    ];

    protected $casts = [
        'ordem' => 'integer',
        'distancia_m' => 'integer',
        'repeticoes' => 'integer',
    ];

    public function training(): BelongsTo
    {
        return $this->belongsTo(Training::class, 'treino_id');
    }
}
