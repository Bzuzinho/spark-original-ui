<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventTypeConfig extends Model
{
    use HasUuids;

    protected $table = 'event_type_configs';

    protected $fillable = [
        'nome',
        'cor',
        'icon',
        'descricao',
        'gera_taxa',
        'valor_taxa_padrao',
        'requer_convocatoria',
        'exige_confirmacao',
        'permite_transporte',
        'ativo',
    ];

    protected $casts = [
        'gera_taxa' => 'boolean',
        'requer_convocatoria' => 'boolean',
        'exige_confirmacao' => 'boolean',
        'permite_transporte' => 'boolean',
        'ativo' => 'boolean',
        'valor_taxa_padrao' => 'decimal:2',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'tipo_config_id');
    }
}
