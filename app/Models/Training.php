<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Training extends Model
{
    use HasUuids;


    protected $fillable = [
        'training_number',
        'date',
        'start_time',
        'end_time',
        'location',
        'season_id',
        'microcycle_id',
        'age_group_id',
        'age_groups',
        'training_type',
        'planned_volume_m',
        'general_notes',
        'description',
        'created_by',
        'event_id',
        'updated_at_custom',
    ];

    protected $casts = [
        'date' => 'date',
        'age_groups' => 'array',
        'planned_volume_m' => 'integer',
        'updated_at_custom' => 'datetime',
    ];

    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class, 'season_id');
    }

    public function microcycle(): BelongsTo
    {
        return $this->belongsTo(Microcycle::class, 'microcycle_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function series(): HasMany
    {
        return $this->hasMany(TrainingSeries::class, 'training_id');
    }

    public function athletes(): HasMany
    {
        return $this->hasMany(TrainingAthlete::class, 'training_id');
    }

    public function presences(): HasMany
    {
        return $this->hasMany(Presence::class, 'training_id');
    }
}
