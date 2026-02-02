<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventTypeConfig extends Model
{
    use HasUuids;

    protected $table = 'event_type_configs';

    protected $fillable = [
        'name',
        'color',
        'description',
        'generates_fee',
        'default_fee_value',
        'requires_call_up',
        'requires_confirmation',
        'allows_transport',
        'active',
    ];

    protected $casts = [
        'generates_fee' => 'boolean',
        'requires_call_up' => 'boolean',
        'requires_confirmation' => 'boolean',
        'allows_transport' => 'boolean',
        'active' => 'boolean',
        'default_fee_value' => 'decimal:2',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'type_config_id');
    }
}
