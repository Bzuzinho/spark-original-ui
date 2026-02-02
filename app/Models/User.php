<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, HasUuids;

    protected $fillable = [
        'name',
        'email',
        'password',
        'email_verified_at',
        // Spark fields (português)
        'numero_socio',
        'nome_completo',
        'perfil',
        'tipo_membro',
        'estado',
        'data_nascimento',
        'menor',
        'sexo',
        'escalao',
        'rgpd',
        'consentimento',
        'afiliacao',
        'declaracao_de_transporte',
        'ativo_desportivo',
        'morada',
        'codigo_postal',
        'localidade',
        'telefone',
        'telemovel',
        'nif',
        'numero_cartao_cidadao',
        'validade_cartao_cidadao',
        'numero_utente',
        'contacto_emergencia_nome',
        'contacto_emergencia_telefone',
        'contacto_emergencia_relacao',
        // Extended fields
        'foto_perfil',
        'cc',
        'nacionalidade',
        'estado_civil',
        'ocupacao',
        'empresa',
        'escola',
        'numero_irmaos',
        'contacto',
        'email_secundario',
        'encarregado_educacao',
        'educandos',
        'contacto_telefonico',
        'tipo_mensalidade',
        'conta_corrente',
        'centro_custo',
        'num_federacao',
        'cartao_federacao',
        'numero_pmb',
        'data_inscricao',
        'inscricao',
        'data_atestado_medico',
        'arquivo_atestado_medico',
        'informacoes_medicas',
        'data_rgpd',
        'arquivo_rgpd',
        'data_consentimento',
        'arquivo_consentimento',
        'data_afiliacao',
        'arquivo_afiliacao',
        'declaracao_transporte',
        'email_utilizador',
        'senha',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'senha',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            // Dates
            'data_nascimento' => 'date',
            'validade_cartao_cidadao' => 'date',
            'data_inscricao' => 'date',
            'data_atestado_medico' => 'date',
            'data_rgpd' => 'date',
            'data_consentimento' => 'date',
            'data_afiliacao' => 'date',
            // Booleans
            'menor' => 'boolean',
            'rgpd' => 'boolean',
            'consentimento' => 'boolean',
            'afiliacao' => 'boolean',
            'declaracao_de_transporte' => 'boolean',
            'ativo_desportivo' => 'boolean',
            // JSON
            'tipo_membro' => 'array',
            'escalao' => 'array',
            'encarregado_educacao' => 'array',
            'educandos' => 'array',
            'centro_custo' => 'array',
            'arquivo_atestado_medico' => 'array',
            // Decimals
            'conta_corrente' => 'decimal:2',
        ];
    }

    // ===================================
    // RELATIONSHIPS
    // ===================================

    /**
     * Many-to-Many: User <-> UserType
     */
    public function userTypes(): BelongsToMany
    {
        return $this->belongsToMany(UserType::class, 'user_user_type', 'user_id', 'user_type_id')
            ->withTimestamps();
    }

    /**
     * BelongsTo: User -> AgeGroup (escalão)
     * Nota: A coluna 'escalao' é JSON, mas pode haver também 'escalao_id' para primary
     */
    public function ageGroup(): BelongsTo
    {
        return $this->belongsTo(AgeGroup::class, 'escalao_id');
    }

    /**
     * Self-referencing Many-to-Many: Encarregados (guardians)
     * Tabela pivot: user_relationships (type = 'encarregado')
     * ✅ CORRIGIDO: relationship_type → type
     */
    public function encarregados(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'user_relationships',
            'user_id',
            'related_user_id'
        )
        ->wherePivot('type', 'encarregado')  // ✅ CORRIGIDO
        ->withPivot('type')
        ->withTimestamps();
    }

    /**
     * Self-referencing Many-to-Many: Educandos (dependents)
     * Inverso da relação encarregados
     * ✅ CORRIGIDO: relationship_type → type
     */
    public function educandos(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'user_relationships',
            'related_user_id',
            'user_id'
        )
        ->wherePivot('type', 'encarregado')  // ✅ CORRIGIDO
        ->withPivot('type')
        ->withTimestamps();
    }

    /**
     * HasMany: User -> Event (creator)
     */
    public function eventsCreated(): HasMany
    {
        return $this->hasMany(Event::class, 'criado_por');
    }

    /**
     * Many-to-Many: User <-> Event (attendance/participation)
     */
    public function eventAttendances(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_participants', 'user_id', 'event_id')
            ->withPivot(['status', 'notes'])
            ->withTimestamps();
    }

    /**
     * HasMany: User -> MemberDocument
     */
    public function documents(): HasMany
    {
        return $this->hasMany(MemberDocument::class, 'member_id');
    }

    /**
     * HasMany: User -> MemberRelationship (custom relationships)
     */
    public function relationships(): HasMany
    {
        return $this->hasMany(MemberRelationship::class, 'user_id');
    }

    /**
     * HasMany: User -> Invoice
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'user_id');
    }

    /**
     * HasMany: User -> MembershipFee
     */
    public function membershipFees(): HasMany
    {
        return $this->hasMany(MembershipFee::class, 'user_id');
    }

    /**
     * HasOne: User -> AthleteSportsData
     */
    public function athleteSportsData(): HasOne
    {
        return $this->hasOne(AthleteSportsData::class, 'user_id');
    }

    /**
     * Many-to-Many: User <-> Team
     */
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_members', 'user_id', 'team_id')
            ->withPivot(['position', 'jersey_number', 'join_date', 'leave_date'])
            ->withTimestamps();
    }

    // ===================================
    // ACCESSORS & SCOPES
    // ===================================

    /**
     * Accessor: Get display name (nome_completo ou name)
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->nome_completo ?? $this->name ?? 'Sem nome';
    }

    /**
     * Scope: Active members only
     */
    public function scopeActive($query)
    {
        return $query->where('estado', 'ativo');
    }

    /**
     * Scope: Athletes only
     */
    public function scopeAthletes($query)
    {
        return $query->whereRaw("tipo_membro::jsonb @> ?", [json_encode('atleta')]);
    }

    /**
     * Scope: Guardians only
     */
    public function scopeGuardians($query)
    {
        return $query->whereRaw("tipo_membro::jsonb @> ?", [json_encode('encarregado_educacao')]);
    }
}
