<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasUuids;


    protected $fillable = [
        'title',
        'description',
        'start_date',
        'start_time',
        'end_date',
        'end_time',
        'location',
        'location_details',
        'type',
        'tipo_config_id',
        'pool_type',
        'visibility',
        'eligible_age_groups',
        'transport_required',
        'transport_details',
        'departure_time',
        'departure_location',
        'registration_fee',
        'cost_per_race',
        'cost_per_dive',
        'relay_cost',
        'centro_custo_id',
        'notes',
        'call_up_file',
        'regulations_file',
        'status',
        'created_by',
        'recurring',
        'recurrence_start_date',
        'recurrence_end_date',
        'recurrence_weekdays',
        'parent_event_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'transport_required' => 'boolean',
        'recurring' => 'boolean',
        'recurrence_start_date' => 'date',
        'recurrence_end_date' => 'date',
        'eligible_age_groups' => 'array',
        'recurrence_weekdays' => 'array',
        'registration_fee' => 'decimal:2',
        'cost_per_race' => 'decimal:2',
        'cost_per_dive' => 'decimal:2',
        'relay_cost' => 'decimal:2',
    ];

    public function tipoConfig(): BelongsTo
    {
        return $this->belongsTo(EventTypeConfig::class, 'tipo_config_id');
    }

    public function costCenter(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'centro_custo_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function parentEvent(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'parent_event_id');
    }

    public function childEvents(): HasMany
    {
        return $this->hasMany(Event::class, 'parent_event_id');
    }

    public function convocations(): HasMany
    {
        return $this->hasMany(EventConvocation::class, 'evento_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(EventConvocation::class, 'evento_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(EventAttendance::class, 'evento_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(EventResult::class, 'evento_id');
    }

    public function trainings(): HasMany
    {
        return $this->hasMany(Training::class, 'evento_id');
    }

    public function competition(): HasMany
    {
        return $this->hasMany(Competition::class, 'evento_id');
    }

    public function convocationGroups(): HasMany
    {
        return $this->hasMany(ConvocationGroup::class, 'evento_id');
    }

    public function convocationMovements(): HasMany
    {
        return $this->hasMany(ConvocationMovement::class, 'evento_id');
    }
}
