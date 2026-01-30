<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResultSplit extends Model
{
    use HasUuids;

    protected $table = 'result_splits';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'resultado_id',
        'distancia_parcial_m',
        'tempo_parcial',
        'ordem',
    ];

    protected $casts = [
        'distancia_parcial_m' => 'integer',
        'ordem' => 'integer',
    ];

    public function result(): BelongsTo
    {
        return $this->belongsTo(Result::class, 'resultado_id');
    }
}
