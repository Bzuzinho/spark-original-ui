<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AthleteSportsData extends Model
{
    use HasUuids;

    protected $table = 'athlete_sports_data';

    protected $fillable = [
        'athlete_id',
        'federation_number',
        'federation_card',
        'pmb_number',
        'age_group_id',
        'registration_date',
        'registration_file',
        'medical_certificate_date',
        'medical_certificate_files',
        'medical_information',
        'active',
    ];

    protected $casts = [
        'registration_date' => 'date',
        'medical_certificate_date' => 'date',
        'medical_certificate_files' => 'array',
        'active' => 'boolean',
    ];

    public function atleta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'athlete_id');
    }

    public function escalao(): BelongsTo
    {
        return $this->belongsTo(AgeGroup::class, 'age_group_id');
    }
}
