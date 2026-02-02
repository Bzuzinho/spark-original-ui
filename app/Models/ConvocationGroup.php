<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConvocationGroup extends Model
{
    use HasUuids;

    protected $table = 'convocation_groups';

    protected $fillable = [
        'event_id',
        'name',
        'age_group',
        'athletes',
    ];

    protected $casts = [
        'athletes' => 'array',
    ];

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function criadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function convocationAthletes(): HasMany
    {
        return $this->hasMany(ConvocationAthlete::class, 'convocation_group_id');
    }

    public function convocationMovements(): HasMany
    {
        return $this->hasMany(ConvocationMovement::class, 'convocation_group_id');
    }
}
