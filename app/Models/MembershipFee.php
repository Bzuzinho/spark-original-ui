<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipFee extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'mes',
        'ano',
        'valor',
        'estado',
        'data_pagamento',
        'transaction_id',
    ];

    protected $casts = [
        'mes' => 'integer',
        'ano' => 'integer',
        'valor' => 'decimal:2',
        'data_pagamento' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }
}
