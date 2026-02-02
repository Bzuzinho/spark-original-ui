<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResultSplit extends Model
{
    use HasUuids;

    protected $table = 'result_splits';

    protected $fillable = [
        'result_id',
        'partial_distance_m',
        'partial_time',
    ];

    protected $casts = [
        'partial_distance_m' => 'integer',
    ];

    public function result(): BelongsTo
    {
        return $this->belongsTo(Result::class, 'result_id');
    }
}
