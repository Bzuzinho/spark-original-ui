<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingSeries extends Model
{
    use HasUuids;

    protected $table = 'training_series';

    protected $fillable = [
        'treino_id',
        'ordem',
        'descricao_texto',
        'distancia_total_m',
        'zona_intensidade',
        'estilo',
        'repeticoes',
        'intervalo',
        'observacoes',
    ];

    protected $casts = [
        'ordem' => 'integer',
        'distancia_total_m' => 'integer',
        'repeticoes' => 'integer',
    ];

    public function training(): BelongsTo
    {
        return $this->belongsTo(Training::class, 'treino_id');
    }
}
