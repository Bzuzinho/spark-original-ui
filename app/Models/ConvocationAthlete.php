<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConvocationAthlete extends Model
{
    protected $table = 'convocation_athletes';
    
    protected $primaryKey = null;
    public $incrementing = false;

    protected $fillable = [
        'convocatoria_grupo_id',
        'atleta_id',
        'provas',
        'estafetas',
        'presente',
        'confirmado',
    ];

    protected $casts = [
        'provas' => 'array',
        'estafetas' => 'integer',
        'presente' => 'boolean',
        'confirmado' => 'boolean',
    ];

    public function convocationGroup(): BelongsTo
    {
        return $this->belongsTo(ConvocationGroup::class, 'convocatoria_grupo_id');
    }

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atleta_id');
    }
}
