<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamMember extends Model
{
    use HasUuids;

    protected $fillable = [
        'team_id',
        'user_id',
        'posicao',
        'numero_camisola',
        'data_entrada',
        'data_saida',
    ];

    protected $casts = [
        'data_entrada' => 'date',
        'data_saida' => 'date',
        'numero_camisola' => 'integer',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
