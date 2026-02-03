<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AthleteSportsData extends Model
{
    use HasUuids;

    protected $table = 'athlete_sports_data';

    protected $fillable = [
        'user_id',
        'num_federacao',
        'cartao_federacao',
        'numero_pmb',
        'escalao_id',
        'data_inscricao',
        'inscricao_path',
        'data_atestado_medico',
        'arquivo_atestado_medico',
        'informacoes_medicas',
        'ativo',
    ];

    protected $casts = [
        'data_inscricao' => 'date',
        'data_atestado_medico' => 'date',
        'arquivo_atestado_medico' => 'array',
        'ativo' => 'boolean',
    ];

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function escalao(): BelongsTo
    {
        return $this->belongsTo(AgeGroup::class, 'escalao_id');
    }
}
