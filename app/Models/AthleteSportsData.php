<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AthleteSportsData extends Model
{
    use HasUuids;

    protected $table = 'athlete_sports_data';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'atleta_id',
        'num_federacao',
        'cartao_federacao',
        'numero_pmb',
        'escalao_id',
        'atestado_medico',
        'validade_atestado',
        'observacoes_medicas',
        'alergias',
        'medicacao',
        'seguro_desportivo',
        'numero_seguro',
        'validade_seguro',
    ];

    protected $casts = [
        'validade_atestado' => 'date',
        'validade_seguro' => 'date',
    ];

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atleta_id');
    }

    public function escalao(): BelongsTo
    {
        return $this->belongsTo(AgeGroup::class, 'escalao_id');
    }
}
