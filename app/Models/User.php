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

    protected $keyType = 'string';
    public $incrementing = false;

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

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'senha',
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
            // Integers
            'numero_irmaos' => 'integer',
        ];
    }

    // Relationships
    public function athleteSportsData(): HasOne
    {
        return $this->hasOne(AthleteSportsData::class, 'atleta_id');
    }

    public function createdEvents(): HasMany
    {
        return $this->hasMany(Event::class, 'criado_por');
    }

    public function convocations(): HasMany
    {
        return $this->hasMany(EventConvocation::class, 'atleta_id');
    }

    public function givenConvocations(): HasMany
    {
        return $this->hasMany(EventConvocation::class, 'convocado_por');
    }

    public function eventAttendances(): HasMany
    {
        return $this->hasMany(EventAttendance::class, 'atleta_id');
    }

    public function eventResults(): HasMany
    {
        return $this->hasMany(EventResult::class, 'atleta_id');
    }

    public function resultProvas(): HasMany
    {
        return $this->hasMany(ResultProva::class, 'atleta_id');
    }

    public function createdTrainings(): HasMany
    {
        return $this->hasMany(Training::class, 'criado_por');
    }

    public function trainingAthletes(): HasMany
    {
        return $this->hasMany(TrainingAthlete::class, 'atleta_id');
    }

    public function presences(): HasMany
    {
        return $this->hasMany(Presence::class, 'atleta_id');
    }

    public function competitionRegistrations(): HasMany
    {
        return $this->hasMany(CompetitionRegistration::class, 'atleta_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class, 'atleta_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'socio_id');
    }

    public function movements(): HasMany
    {
        return $this->hasMany(Movement::class, 'socio_id');
    }

    public function convocationMovements(): HasMany
    {
        return $this->hasMany(ConvocationMovement::class, 'atleta_id');
    }

    public function financialEntries(): HasMany
    {
        return $this->hasMany(FinancialEntry::class, 'usuario_id');
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Sale::class, 'comprador_id');
    }

    public function salesMade(): HasMany
    {
        return $this->hasMany(Sale::class, 'vendedor_id');
    }

    public function newsItems(): HasMany
    {
        return $this->hasMany(NewsItem::class, 'autor_id');
    }

    public function sentCommunications(): HasMany
    {
        return $this->hasMany(Communication::class, 'remetente_id');
    }

    public function createdConvocationGroups(): HasMany
    {
        return $this->hasMany(ConvocationGroup::class, 'criado_por');
    }

    public function convocationAthletes(): HasMany
    {
        return $this->hasMany(ConvocationAthlete::class, 'atleta_id');
    }
}
