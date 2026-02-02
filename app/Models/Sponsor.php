<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sponsor extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'description',
        'contact',
        'type',
        'annual_value',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'annual_value' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'ativo');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expirado')
                     ->orWhere(function($q) {
                         $q->whereNotNull('end_date')
                           ->where('end_date', '<', now());
                     });
    }

    // Accessor
    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'ativo' && 
               ($this->end_date === null || $this->end_date > now());
    }
}
