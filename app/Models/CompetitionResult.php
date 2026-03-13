<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompetitionResult extends Model
{
    protected $table = 'competition_results';

    protected $fillable = [
        'competition_id',
        'user_id',
        'prova',
        'tempo',
        'colocacao',
        'desqualificado',
    ];

    protected $casts = [
        'desqualificado' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
