<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Spark-specific fields
            $table->string('numero_socio')->unique()->nullable();
            $table->string('nome_completo')->nullable();
            $table->string('perfil')->default('user'); // admin, user, atleta
            $table->jsonb('tipo_membro')->default('[]'); // Array de tipos
            $table->string('estado')->default('ativo'); // ativo, inativo, suspenso
            $table->date('data_nascimento')->nullable();
            $table->boolean('menor')->default(false);
            $table->string('sexo')->nullable(); // masculino, feminino
            $table->jsonb('escalao')->default('[]'); // Array de IDs de escalões
            
            // Consents/Documents
            $table->boolean('rgpd')->default(false);
            $table->boolean('consentimento')->default(false);
            $table->boolean('afiliacao')->default(false);
            $table->boolean('declaracao_de_transporte')->default(false);
            
            // Sports-related
            $table->boolean('ativo_desportivo')->default(false);
            
            // Additional info
            $table->text('morada')->nullable();
            $table->string('codigo_postal')->nullable();
            $table->string('localidade')->nullable();
            $table->string('telefone')->nullable();
            $table->string('telemovel')->nullable();
            $table->string('nif')->nullable();
            $table->string('numero_cartao_cidadao')->nullable();
            $table->date('validade_cartao_cidadao')->nullable();
            $table->string('numero_utente')->nullable();
            
            // Emergency contact
            $table->string('contacto_emergencia_nome')->nullable();
            $table->string('contacto_emergencia_telefone')->nullable();
            $table->string('contacto_emergencia_relacao')->nullable();
            
            // Indexes
            $table->index('numero_socio');
            $table->index('perfil');
            $table->index('estado');
            $table->index('ativo_desportivo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'numero_socio', 'nome_completo', 'perfil', 'tipo_membro',
                'estado', 'data_nascimento', 'menor', 'sexo', 'escalao',
                'rgpd', 'consentimento', 'afiliacao', 'declaracao_de_transporte',
                'ativo_desportivo', 'morada', 'codigo_postal', 'localidade',
                'telefone', 'telemovel', 'nif', 'numero_cartao_cidadao',
                'validade_cartao_cidadao', 'numero_utente',
                'contacto_emergencia_nome', 'contacto_emergencia_telefone',
                'contacto_emergencia_relacao'
            ]);
        });
    }
};
