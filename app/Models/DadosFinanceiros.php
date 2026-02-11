<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DadosFinanceiros extends Model
{
    use HasUuids;

    protected $table = 'dados_financeiros';

    protected $fillable = [
        'user_id',
        'mensalidade_id',
        'conta_corrente_manual',
    ];

    protected $casts = [
        'conta_corrente_manual' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function mensalidade(): BelongsTo
    {
        return $this->belongsTo(MonthlyFee::class, 'mensalidade_id');
    }
}
