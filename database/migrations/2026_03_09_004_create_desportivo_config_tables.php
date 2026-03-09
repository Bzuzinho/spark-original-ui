<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * FASE 3: Migration de Suporte
     * Cria tabelas para catálogos técnicos do módulo Desportivo (Configurações)
     */
    public function up(): void
    {
        // 1. Estados de Atleta (presente, ausente, justificado, lesionado, limitado)
        Schema::create('athlete_status_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('codigo', 30)->unique();
            $table->string('nome', 100);
            $table->string('nome_en', 100)->nullable();
            $table->string('descricao')->nullable();
            $table->string('cor', 7)->default('#6B7280'); // hex color
            $table->boolean('ativo')->default(true);
            $table->integer('ordem')->default(0);
            $table->timestamps();
            
            $table->index('ativo');
            $table->index('ordem');
        });

        // 2. Tipos de Treino (tecnico, resistencia, velocidade, tapering, regeneracao)
        Schema::create('training_type_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('codigo', 30)->unique();
            $table->string('nome', 100);
            $table->string('nome_en', 100)->nullable();
            $table->text('descricao')->nullable();
            $table->string('cor', 7)->default('#3B82F6');
            $table->boolean('ativo')->default(true);
            $table->integer('ordem')->default(0);
            $table->timestamps();
            
            $table->index('ativo');
            $table->index('ordem');
        });

        // 3. Zonas de Treino (Z1, Z2, Z3, etc.)
        Schema::create('training_zone_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('codigo', 30)->unique();
            $table->string('nome', 100);
            $table->text('descricao')->nullable();
            $table->integer('percentagem_min')->nullable(); // % FC min
            $table->integer('percentagem_max')->nullable(); // % FC max
            $table->string('cor', 7)->default('#10B981');
            $table->boolean('ativo')->default(true);
            $table->integer('ordem')->default(0);
            $table->timestamps();
            
            $table->index('ativo');
            $table->index('ordem');
        });

        // 4. Motivos de Ausência (doença, trabalho, estudos, outros)
        Schema::create('absence_reason_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('codigo', 30)->unique();
            $table->string('nome', 100);
            $table->string('nome_en', 100)->nullable();
            $table->text('descricao')->nullable();
            $table->boolean('requer_justificacao')->default(false);
            $table->boolean('ativo')->default(true);
            $table->integer('ordem')->default(0);
            $table->timestamps();
            
            $table->index('ativo');
            $table->index('requer_justificacao');
            $table->index('ordem');
        });

        // 5. Motivos de Lesão (muscular, articular, fadiga, outros)
        Schema::create('injury_reason_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('codigo', 30)->unique();
            $table->string('nome', 100);
            $table->string('nome_en', 100)->nullable();
            $table->text('descricao')->nullable();
            $table->string('gravidade', 20)->default('media'); // leve|media|grave
            $table->boolean('ativo')->default(true);
            $table->integer('ordem')->default(0);
            $table->timestamps();
            
            $table->index('ativo');
            $table->index('gravidade');
            $table->index('ordem');
        });

        // 6. Tipos de Piscina (25m, 50m, mar aberto)
        Schema::create('pool_type_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('codigo', 30)->unique();
            $table->string('nome', 100);
            $table->integer('comprimento_m')->nullable();
            $table->boolean('ativo')->default(true);
            $table->integer('ordem')->default(0);
            $table->timestamps();
            
            $table->index('ativo');
            $table->index('ordem');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pool_type_configs');
        Schema::dropIfExists('injury_reason_configs');
        Schema::dropIfExists('absence_reason_configs');
        Schema::dropIfExists('training_zone_configs');
        Schema::dropIfExists('training_type_configs');
        Schema::dropIfExists('athlete_status_configs');
    }
};
