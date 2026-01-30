<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompetitionRegistration extends Model
{
    use HasUuids;

    protected $table = 'competition_registrations';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'prova_id',
        'atleta_id',
        'estado',
        'tempo_inscricao',
        'valor_inscricao',
        'data_inscricao',
        'observacoes',
    ];

    protected $casts = [
        'data_inscricao' => 'datetime',
        'valor_inscricao' => 'decimal:2',
    ];

    public function prova(): BelongsTo
    {
        return $this->belongsTo(Prova::class, 'prova_id');
    }

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atleta_id');
    }
}
