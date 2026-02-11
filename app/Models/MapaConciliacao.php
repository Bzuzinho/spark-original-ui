<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MapaConciliacao extends Model
{
    use HasUuids;

    protected $table = 'mapa_conciliacao';

    protected $fillable = [
        'extrato_id',
        'lancamento_id',
        'status',
        'regra_usada',
    ];

    public function extrato(): BelongsTo
    {
        return $this->belongsTo(BankStatement::class, 'extrato_id');
    }

    public function lancamento(): BelongsTo
    {
        return $this->belongsTo(FinancialEntry::class, 'lancamento_id');
    }
}
