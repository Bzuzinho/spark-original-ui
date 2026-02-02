<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Communication extends Model
{
    use HasUuids;

    protected $fillable = [
        'subject',
        'message',
        'type',
        'recipients',
        'status',
        'scheduled_for',
        'sent_at',
        'total_sent',
        'total_failed',
    ];

    protected $casts = [
        'recipients' => 'array',
        'scheduled_for' => 'datetime',
        'sent_at' => 'datetime',
    ];

    /**
     * Scope to get sent communications
     */
    public function scopeSent(Builder $query): Builder
    {
        return $query->where('status', 'enviada');
    }

    /**
     * Scope to get scheduled communications
     */
    public function scopeScheduled(Builder $query): Builder
    {
        return $query->where('status', 'agendada');
    }

    /**
     * Scope to get draft communications
     */
    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', 'rascunho');
    }

    /**
     * Scope to get failed communications
     */
    public function scopeFailed(Builder $query): Builder
    {
        return $query->where('status', 'falhou');
    }
}
