<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Result extends Model
{
    use HasUuids;


    protected $fillable = [
        'prova_id',
        'atleta_id',
        'tempo_oficial',
        'tempo_reacao',
        'posicao',
        'pontos_fina',
        'record_pessoal',
        'record_clube',
        'desclassificado',
        'observacoes',
    ];

    protected $casts = [
        'posicao' => 'integer',
        'pontos_fina' => 'integer',
        'record_pessoal' => 'boolean',
        'record_clube' => 'boolean',
        'desclassificado' => 'boolean',
    ];

    public function prova(): BelongsTo
    {
        return $this->belongsTo(Prova::class, 'prova_id');
    }

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atleta_id');
    }

    public function splits(): HasMany
    {
        return $this->hasMany(ResultSplit::class, 'resultado_id');
    }
}
