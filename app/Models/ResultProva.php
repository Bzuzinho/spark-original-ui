<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResultProva extends Model
{
    use HasUuids;

    protected $table = 'result_provas';

    protected $fillable = [
        'atleta_id',
        'evento_id',
        'prova',
        'tempo_final',
        'data',
        'local',
        'observacoes',
    ];

    protected $casts = [
        'data' => 'date',
    ];

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atleta_id');
    }

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'evento_id');
    }
}
