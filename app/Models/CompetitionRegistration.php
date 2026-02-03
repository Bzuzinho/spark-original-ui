<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompetitionRegistration extends Model
{
    use HasUuids;

    protected $table = 'competition_registrations';

    protected $fillable = [
        'prova_id',
        'user_id',
        'estado',
        'valor_inscricao',
        'fatura_id',
        'movimento_id',
    ];

    protected $casts = [
        'valor_inscricao' => 'decimal:2',
    ];

    public function prova(): BelongsTo
    {
        return $this->belongsTo(Prova::class, 'prova_id');
    }

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
