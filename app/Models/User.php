<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        // Spark fields
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
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
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
            // Spark casts
            'data_nascimento' => 'date',
            'validade_cartao_cidadao' => 'date',
            'menor' => 'boolean',
            'rgpd' => 'boolean',
            'consentimento' => 'boolean',
            'afiliacao' => 'boolean',
            'declaracao_de_transporte' => 'boolean',
            'ativo_desportivo' => 'boolean',
            'tipo_membro' => 'array',
            'escalao' => 'array',
        ];
    }
}
