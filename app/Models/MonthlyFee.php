<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MonthlyFee extends Model
{
    use HasUuids;

    protected $table = 'monthly_fees';

    protected $fillable = [
        'month',
        'year',
        'base_amount',
        'discounts',
        'final_amount',
        'active',
    ];

    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
        'base_amount' => 'decimal:2',
        'discounts' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'active' => 'boolean',
    ];
}
