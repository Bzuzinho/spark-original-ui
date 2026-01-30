<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgeGroup extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'description',
        'min_age',
        'max_age',
        'min_year',
        'max_year',
        'sexo',
        'active',
    ];

    protected $casts = [
        'min_age' => 'integer',
        'max_age' => 'integer',
        'min_year' => 'integer',
        'max_year' => 'integer',
        'active' => 'boolean',
    ];

    public function provas(): HasMany
    {
        return $this->hasMany(Prova::class, 'escalao_id');
    }

    public function athleteSportsData(): HasMany
    {
        return $this->hasMany(AthleteSportsData::class, 'escalao_id');
    }
}
