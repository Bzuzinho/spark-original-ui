<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MonthlyFee extends Model
{
    use HasUuids;

    protected $table = 'monthly_fees';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'designacao',
        'descricao',
        'valor',
        'tipo_membro',
        'escalao',
        'ativo',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'ativo' => 'boolean',
    ];
}
