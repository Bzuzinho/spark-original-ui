<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgeGroup extends Model
{
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
}
