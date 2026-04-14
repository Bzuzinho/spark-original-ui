<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notification_preferences', function (Blueprint $table) {
            $table->boolean('automacoes_financeiro')->default(true)->after('alertas_atividade');
            $table->boolean('automacoes_eventos')->default(true)->after('automacoes_financeiro');
            $table->boolean('automacoes_logistica')->default(true)->after('automacoes_eventos');
            $table->boolean('automacoes_faturas_financeiras')->default(true)->after('automacoes_logistica');
            $table->boolean('automacoes_movimentos_financeiros')->default(true)->after('automacoes_faturas_financeiras');
            $table->boolean('automacoes_convocatorias_eventos')->default(true)->after('automacoes_movimentos_financeiros');
            $table->boolean('automacoes_requisicoes_logistica')->default(true)->after('automacoes_convocatorias_eventos');
            $table->boolean('automacoes_alertas_operacionais')->default(true)->after('automacoes_requisicoes_logistica');
        });
    }

    public function down(): void
    {
        Schema::table('notification_preferences', function (Blueprint $table) {
            $table->dropColumn([
                'automacoes_financeiro',
                'automacoes_eventos',
                'automacoes_logistica',
                'automacoes_faturas_financeiras',
                'automacoes_movimentos_financeiros',
                'automacoes_convocatorias_eventos',
                'automacoes_requisicoes_logistica',
                'automacoes_alertas_operacionais',
            ]);
        });
    }
};