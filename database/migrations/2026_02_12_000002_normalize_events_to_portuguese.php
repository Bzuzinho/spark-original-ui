<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $this->renameIfExists($table, 'title', 'titulo');
            $this->renameIfExists($table, 'description', 'descricao');
            $this->renameIfExists($table, 'start_date', 'data_inicio');
            $this->renameIfExists($table, 'start_time', 'hora_inicio');
            $this->renameIfExists($table, 'end_date', 'data_fim');
            $this->renameIfExists($table, 'end_time', 'hora_fim');
            $this->renameIfExists($table, 'location', 'local');
            $this->renameIfExists($table, 'location_details', 'local_detalhes');
            $this->renameIfExists($table, 'type', 'tipo');
            $this->renameIfExists($table, 'pool_type', 'tipo_piscina');
            $this->renameIfExists($table, 'visibility', 'visibilidade');
            $this->renameIfExists($table, 'eligible_age_groups', 'escaloes_elegiveis');
            $this->renameIfExists($table, 'transport_required', 'transporte_necessario');
            $this->renameIfExists($table, 'transport_details', 'transporte_detalhes');
            $this->renameIfExists($table, 'departure_time', 'hora_partida');
            $this->renameIfExists($table, 'departure_location', 'local_partida');
            $this->renameIfExists($table, 'registration_fee', 'taxa_inscricao');
            $this->renameIfExists($table, 'cost_per_race', 'custo_inscricao_por_prova');
            $this->renameIfExists($table, 'cost_per_dive', 'custo_inscricao_por_salto');
            $this->renameIfExists($table, 'relay_cost', 'custo_inscricao_estafeta');
            $this->renameIfExists($table, 'notes', 'observacoes');
            $this->renameIfExists($table, 'call_up_file', 'convocatoria_ficheiro');
            $this->renameIfExists($table, 'regulations_file', 'regulamento_ficheiro');
            $this->renameIfExists($table, 'status', 'estado');
            $this->renameIfExists($table, 'created_by', 'criado_por');
            $this->renameIfExists($table, 'recurring', 'recorrente');
            $this->renameIfExists($table, 'recurrence_start_date', 'recorrencia_data_inicio');
            $this->renameIfExists($table, 'recurrence_end_date', 'recorrencia_data_fim');
            $this->renameIfExists($table, 'recurrence_weekdays', 'recorrencia_dias_semana');
            $this->renameIfExists($table, 'parent_event_id', 'evento_pai_id');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $this->renameIfExists($table, 'titulo', 'title');
            $this->renameIfExists($table, 'descricao', 'description');
            $this->renameIfExists($table, 'data_inicio', 'start_date');
            $this->renameIfExists($table, 'hora_inicio', 'start_time');
            $this->renameIfExists($table, 'data_fim', 'end_date');
            $this->renameIfExists($table, 'hora_fim', 'end_time');
            $this->renameIfExists($table, 'local', 'location');
            $this->renameIfExists($table, 'local_detalhes', 'location_details');
            $this->renameIfExists($table, 'tipo', 'type');
            $this->renameIfExists($table, 'tipo_piscina', 'pool_type');
            $this->renameIfExists($table, 'visibilidade', 'visibility');
            $this->renameIfExists($table, 'escaloes_elegiveis', 'eligible_age_groups');
            $this->renameIfExists($table, 'transporte_necessario', 'transport_required');
            $this->renameIfExists($table, 'transporte_detalhes', 'transport_details');
            $this->renameIfExists($table, 'hora_partida', 'departure_time');
            $this->renameIfExists($table, 'local_partida', 'departure_location');
            $this->renameIfExists($table, 'taxa_inscricao', 'registration_fee');
            $this->renameIfExists($table, 'custo_inscricao_por_prova', 'cost_per_race');
            $this->renameIfExists($table, 'custo_inscricao_por_salto', 'cost_per_dive');
            $this->renameIfExists($table, 'custo_inscricao_estafeta', 'relay_cost');
            $this->renameIfExists($table, 'observacoes', 'notes');
            $this->renameIfExists($table, 'convocatoria_ficheiro', 'call_up_file');
            $this->renameIfExists($table, 'regulamento_ficheiro', 'regulations_file');
            $this->renameIfExists($table, 'estado', 'status');
            $this->renameIfExists($table, 'criado_por', 'created_by');
            $this->renameIfExists($table, 'recorrente', 'recurring');
            $this->renameIfExists($table, 'recorrencia_data_inicio', 'recurrence_start_date');
            $this->renameIfExists($table, 'recorrencia_data_fim', 'recurrence_end_date');
            $this->renameIfExists($table, 'recorrencia_dias_semana', 'recurrence_weekdays');
            $this->renameIfExists($table, 'evento_pai_id', 'parent_event_id');
        });
    }

    private function renameIfExists(Blueprint $table, string $from, string $to): void
    {
        if (Schema::hasColumn('events', $from) && !Schema::hasColumn('events', $to)) {
            $table->renameColumn($from, $to);
        }
    }
};
