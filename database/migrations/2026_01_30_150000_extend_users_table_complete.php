<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Personal info (additional fields)
            $table->string('foto_perfil')->nullable();
            $table->string('cc')->nullable();
            $table->string('nacionalidade')->nullable();
            $table->string('estado_civil')->nullable();
            $table->string('ocupacao')->nullable();
            $table->string('empresa')->nullable();
            $table->string('escola')->nullable();
            $table->integer('numero_irmaos')->nullable();
            $table->string('contacto')->nullable();
            $table->string('email_secundario')->nullable();
            $table->json('encarregado_educacao')->nullable();
            $table->json('educandos')->nullable();
            $table->string('contacto_telefonico')->nullable();
            
            // Financial fields
            $table->string('tipo_mensalidade')->nullable();
            $table->decimal('conta_corrente', 10, 2)->default(0);
            $table->json('centro_custo')->nullable();
            
            // Sports fields
            $table->string('num_federacao')->nullable();
            $table->string('cartao_federacao')->nullable();
            $table->string('numero_pmb')->nullable();
            $table->date('data_inscricao')->nullable();
            $table->string('inscricao')->nullable();
            $table->date('data_atestado_medico')->nullable();
            $table->json('arquivo_atestado_medico')->nullable();
            $table->text('informacoes_medicas')->nullable();
            
            // Consents with dates and files
            $table->date('data_rgpd')->nullable();
            $table->string('arquivo_rgpd')->nullable();
            $table->date('data_consentimento')->nullable();
            $table->string('arquivo_consentimento')->nullable();
            $table->date('data_afiliacao')->nullable();
            $table->string('arquivo_afiliacao')->nullable();
            $table->string('declaracao_transporte')->nullable();
            
            // User authentication
            $table->string('email_utilizador')->nullable();
            $table->string('senha')->nullable();
            
            // Indexes
            $table->index('num_federacao');
            $table->index('tipo_mensalidade');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'foto_perfil', 'cc', 'nacionalidade', 'estado_civil', 'ocupacao',
                'empresa', 'escola', 'numero_irmaos', 'contacto', 'email_secundario',
                'encarregado_educacao', 'educandos', 'contacto_telefonico',
                'tipo_mensalidade', 'conta_corrente', 'centro_custo',
                'num_federacao', 'cartao_federacao', 'numero_pmb', 'data_inscricao',
                'inscricao', 'data_atestado_medico', 'arquivo_atestado_medico',
                'informacoes_medicas', 'data_rgpd', 'arquivo_rgpd', 'data_consentimento',
                'arquivo_consentimento', 'data_afiliacao', 'arquivo_afiliacao',
                'declaracao_transporte', 'email_utilizador', 'senha'
            ]);
        });
    }
};
