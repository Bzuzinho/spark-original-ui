<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    use HasUuids;

    protected $fillable = [
        'nome',
        'escalao',
        'treinador_id',
        'ano_fundacao',
        'ativa',
    ];

    protected $casts = [
        'ativa' => 'boolean',
        'ano_fundacao' => 'integer',
    ];

    public function treinador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'treinador_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }

    public function trainingSessions(): HasMany
    {
        return $this->hasMany(TrainingSession::class);
    }

    public function callUps(): HasMany
    {
        return $this->hasMany(CallUp::class);
    }
}
