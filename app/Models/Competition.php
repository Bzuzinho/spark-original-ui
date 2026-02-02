<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Competition extends Model
{
    use HasUuids;


    protected $fillable = [
        'event_id',
        'name',
        'location',
        'start_date',
        'end_date',
        'type',
        'level',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function provas(): HasMany
    {
        return $this->hasMany(Prova::class, 'competition_id');
    }
}
