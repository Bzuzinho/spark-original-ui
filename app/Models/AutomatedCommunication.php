<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AutomatedCommunication extends Model
{
    use HasUuids;

    protected $table = 'automated_communications';

    protected $fillable = [
        'name',
        'description',
        'type',
        'trigger',
        'subject',
        'message',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
