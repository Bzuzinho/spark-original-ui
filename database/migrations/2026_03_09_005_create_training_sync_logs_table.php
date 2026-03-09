<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * FASE 3: Migration de Suporte
     * Cria tabela para logs de sincronização entre training_athletes e event_attendances
     */
    public function up(): void
    {
        Schema::create('training_sync_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Entidade de origem
            $table->string('source_table', 50); // 'training_athletes' ou 'event_attendances'
            $table->uuid('source_id'); // ID do registo de origem
            
            // Entidade de destino
            $table->string('target_table', 50);
            $table->uuid('target_id')->nullable(); // ID do registo criado/atualizado
            
            // Tipo de operação
            $table->string('action', 20); // 'create', 'update', 'delete', 'sync_failed'
            
            // Estado da sincronização
            $table->string('status', 20)->default('success'); // 'success', 'failed', 'retrying'
            
            // Dados antes/depois (JSON para auditoria)
            $table->json('payload_before')->nullable();
            $table->json('payload_after')->nullable();
            
            // Erro (se aplicável)
            $table->text('error_message')->nullable();
            $table->text('stack_trace')->nullable();
            
            // Metadata
            $table->uuid('triggered_by')->nullable(); // user_id que iniciou a ação
            $table->string('ip_address', 45)->nullable();
            $table->integer('retry_count')->default(0);
            
            $table->timestamps();
            
            // Índices para queries de auditoria
            $table->index(['source_table', 'source_id']);
            $table->index(['target_table', 'target_id']);
            $table->index('status');
            $table->index('action');
            $table->index('created_at');
            
            // FK opcional para user
            $table->foreign('triggered_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_sync_logs');
    }
};
