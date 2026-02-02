<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, HasUuids;


    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        // Basic Spark fields
        'member_number',
        'full_name',
        'profile',
        'member_type',
        'status',
        'birth_date',
        'is_minor',
        'gender',
        'age_groups',
        'gdpr_consent',
        'consent',
        'affiliation',
        'transport_declaration',
        'sports_active',
        'address',
        'postal_code',
        'city',
        'phone',
        'mobile',
        'nif',
        'id_card_number',
        'id_card_expiry',
        'health_number',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        // Extended fields
        'profile_photo',
        'cc',
        'nationality',
        'marital_status',
        'occupation',
        'company',
        'school',
        'siblings_count',
        'contact',
        'secondary_email',
        'guardians',
        'dependents',
        'phone_contact',
        'membership_fee_type',
        'current_account',
        'cost_centers',
        'federation_number',
        'federation_card',
        'pmb_number',
        'registration_date',
        'registration_file',
        'medical_certificate_date',
        'medical_certificate_files',
        'medical_information',
        'gdpr_date',
        'gdpr_file',
        'consent_date',
        'consent_file',
        'affiliation_date',
        'affiliation_file',
        'transport_declaration_file',
        'user_email',
        'user_password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'user_password',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            // Dates
            'birth_date' => 'date',
            'id_card_expiry' => 'date',
            'registration_date' => 'date',
            'medical_certificate_date' => 'date',
            'gdpr_date' => 'date',
            'consent_date' => 'date',
            'affiliation_date' => 'date',
            // Booleans
            'is_minor' => 'boolean',
            'gdpr_consent' => 'boolean',
            'consent' => 'boolean',
            'affiliation' => 'boolean',
            'transport_declaration' => 'boolean',
            'sports_active' => 'boolean',
            // JSON
            'member_type' => 'array',
            'age_groups' => 'array',
            'guardians' => 'array',
            'dependents' => 'array',
            'cost_centers' => 'array',
            'medical_certificate_files' => 'array',
            // Decimals
            'current_account' => 'decimal:2',
            // Integers
            'siblings_count' => 'integer',
        ];
    }

    // Relationships
    public function athleteSportsData(): HasOne
    {
        return $this->hasOne(AthleteSportsData::class, 'athlete_id');
    }

    public function createdEvents(): HasMany
    {
        return $this->hasMany(Event::class, 'created_by');
    }

    public function convocations(): HasMany
    {
        return $this->hasMany(EventConvocation::class, 'athlete_id');
    }

    public function givenConvocations(): HasMany
    {
        return $this->hasMany(EventConvocation::class, 'called_up_by');
    }

    public function eventAttendances(): HasMany
    {
        return $this->hasMany(EventAttendance::class, 'athlete_id');
    }

    public function eventResults(): HasMany
    {
        return $this->hasMany(EventResult::class, 'athlete_id');
    }

    public function resultProvas(): HasMany
    {
        return $this->hasMany(ResultProva::class, 'athlete_id');
    }

    public function createdTrainings(): HasMany
    {
        return $this->hasMany(Training::class, 'created_by');
    }

    public function trainingAthletes(): HasMany
    {
        return $this->hasMany(TrainingAthlete::class, 'athlete_id');
    }

    public function presences(): HasMany
    {
        return $this->hasMany(Presence::class, 'athlete_id');
    }

    public function competitionRegistrations(): HasMany
    {
        return $this->hasMany(CompetitionRegistration::class, 'athlete_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class, 'athlete_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'user_id');
    }

    public function movements(): HasMany
    {
        return $this->hasMany(Movement::class, 'user_id');
    }

    public function convocationMovements(): HasMany
    {
        return $this->hasMany(ConvocationMovement::class, 'athlete_id');
    }

    public function financialEntries(): HasMany
    {
        return $this->hasMany(FinancialEntry::class, 'user_id');
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Sale::class, 'user_id');
    }

    public function salesMade(): HasMany
    {
        return $this->hasMany(Sale::class, 'seller_id');
    }

    public function newsItems(): HasMany
    {
        return $this->hasMany(NewsItem::class, 'author_id');
    }

    public function sentCommunications(): HasMany
    {
        return $this->hasMany(Communication::class, 'sender_id');
    }

    public function createdConvocationGroups(): HasMany
    {
        return $this->hasMany(ConvocationGroup::class, 'created_by');
    }

    public function convocationAthletes(): HasMany
    {
        return $this->hasMany(ConvocationAthlete::class, 'athlete_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(UserDocument::class);
    }

    public function relationships(): HasMany
    {
        return $this->hasMany(UserRelationship::class);
    }

    public function relatedToMe(): HasMany
    {
        return $this->hasMany(UserRelationship::class, 'related_user_id');
    }
}
