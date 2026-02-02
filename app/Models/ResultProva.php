<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResultProva extends Model
{
    use HasUuids;

    protected $table = 'result_provas';

    protected $fillable = [
        'athlete_id',
        'event_id',
        'event_name',
        'race',
        'location',
        'date',
        'pool',
        'final_time',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'athlete_id');
    }

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }
}
