<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingSeries extends Model
{
    use HasUuids;

    protected $table = 'training_series';

    protected $fillable = [
        'training_id',
        'order',
        'description',
        'total_distance_m',
        'stroke',
        'intensity_zone',
        'target_time',
        'repetitions',
        'interval',
        'equipment',
        'notes',
    ];

    protected $casts = [
        'order' => 'integer',
        'total_distance_m' => 'integer',
        'repetitions' => 'integer',
    ];

    public function training(): BelongsTo
    {
        return $this->belongsTo(Training::class, 'training_id');
    }
}
