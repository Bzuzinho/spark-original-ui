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
        'user_id',
        'official_time',
        'tempo_reacao',
        'position',
        'fina_points',
        'record_pessoal',
        'record_clube',
        'disqualified',
        'notes',
    ];

    protected $casts = [
        'position' => 'integer',
        'fina_points' => 'integer',
        'record_pessoal' => 'boolean',
        'record_clube' => 'boolean',
        'disqualified' => 'boolean',
    ];

    public function prova(): BelongsTo
    {
        return $this->belongsTo(Prova::class, 'prova_id');
    }

    public function athlete(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function splits(): HasMany
    {
        return $this->hasMany(ResultSplit::class, 'resultado_id');
    }
}
