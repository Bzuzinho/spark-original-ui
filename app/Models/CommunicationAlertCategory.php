<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CommunicationAlertCategory extends Model
{
    use HasUuids;

    protected $fillable = [
        'code',
        'name',
        'description',
        'channels',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'channels' => 'array',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];
}