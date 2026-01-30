<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CostCenter extends Model
{
    use HasUuids;


    protected $fillable = [
        'code',
        'name',
        'description',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'centro_custo_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'centro_custo_id');
    }

    public function invoiceItems(): HasMany
    {
        return $this->hasMany(InvoiceItem::class, 'centro_custo_id');
    }

    public function movements(): HasMany
    {
        return $this->hasMany(Movement::class, 'centro_custo_id');
    }

    public function movementItems(): HasMany
    {
        return $this->hasMany(MovementItem::class, 'centro_custo_id');
    }

    public function financialEntries(): HasMany
    {
        return $this->hasMany(FinancialEntry::class, 'centro_custo_id');
    }

    public function bankStatements(): HasMany
    {
        return $this->hasMany(BankStatement::class, 'centro_custo_id');
    }
}
