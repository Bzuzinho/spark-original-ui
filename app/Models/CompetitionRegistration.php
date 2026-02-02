<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompetitionRegistration extends Model
{
    use HasUuids;

    protected $table = 'competition_registrations';

    protected $fillable = [
        'competition_id',
        'athlete_id',
        'races',
        'status',
        'notes',
    ];

    protected $casts = [
        'races' => 'array',
    ];

    public function prova(): BelongsTo
    {
        return $this->belongsTo(Prova::class, 'competition_id');
    }

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'athlete_id');
    }
}
