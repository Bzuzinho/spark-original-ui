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
            // Rename Portuguese columns to English
            $table->renameColumn('titulo', 'title');
            $table->renameColumn('descricao', 'description');
            $table->renameColumn('data_inicio', 'start_date');
            $table->renameColumn('hora_inicio', 'start_time');
            $table->renameColumn('data_fim', 'end_date');
            $table->renameColumn('hora_fim', 'end_time');
            $table->renameColumn('local', 'location');
            $table->renameColumn('local_detalhes', 'location_details');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('tipo_piscina', 'pool_type');
            $table->renameColumn('visibilidade', 'visibility');
            $table->renameColumn('escaloes_elegiveis', 'eligible_age_groups');
            $table->renameColumn('transporte_necessario', 'transport_required');
            $table->renameColumn('transporte_detalhes', 'transport_details');
            $table->renameColumn('hora_partida', 'departure_time');
            $table->renameColumn('local_partida', 'departure_location');
            $table->renameColumn('taxa_inscricao', 'registration_fee');
            $table->renameColumn('custo_inscricao_por_prova', 'cost_per_race');
            $table->renameColumn('custo_inscricao_por_salto', 'cost_per_dive');
            $table->renameColumn('custo_inscricao_estafeta', 'relay_cost');
            $table->renameColumn('observacoes', 'notes');
            $table->renameColumn('convocatoria_ficheiro', 'call_up_file');
            $table->renameColumn('regulamento_ficheiro', 'regulations_file');
            $table->renameColumn('estado', 'status');
            $table->renameColumn('criado_por', 'created_by');
            $table->renameColumn('recorrente', 'recurring');
            $table->renameColumn('recorrencia_data_inicio', 'recurrence_start_date');
            $table->renameColumn('recorrencia_data_fim', 'recurrence_end_date');
            $table->renameColumn('recorrencia_dias_semana', 'recurrence_weekdays');
            $table->renameColumn('evento_pai_id', 'parent_event_id');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Reverse the column renames
            $table->renameColumn('title', 'titulo');
            $table->renameColumn('description', 'descricao');
            $table->renameColumn('start_date', 'data_inicio');
            $table->renameColumn('start_time', 'hora_inicio');
            $table->renameColumn('end_date', 'data_fim');
            $table->renameColumn('end_time', 'hora_fim');
            $table->renameColumn('location', 'local');
            $table->renameColumn('location_details', 'local_detalhes');
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('pool_type', 'tipo_piscina');
            $table->renameColumn('visibility', 'visibilidade');
            $table->renameColumn('eligible_age_groups', 'escaloes_elegiveis');
            $table->renameColumn('transport_required', 'transporte_necessario');
            $table->renameColumn('transport_details', 'transporte_detalhes');
            $table->renameColumn('departure_time', 'hora_partida');
            $table->renameColumn('departure_location', 'local_partida');
            $table->renameColumn('registration_fee', 'taxa_inscricao');
            $table->renameColumn('cost_per_race', 'custo_inscricao_por_prova');
            $table->renameColumn('cost_per_dive', 'custo_inscricao_por_salto');
            $table->renameColumn('relay_cost', 'custo_inscricao_estafeta');
            $table->renameColumn('notes', 'observacoes');
            $table->renameColumn('call_up_file', 'convocatoria_ficheiro');
            $table->renameColumn('regulations_file', 'regulamento_ficheiro');
            $table->renameColumn('status', 'estado');
            $table->renameColumn('created_by', 'criado_por');
            $table->renameColumn('recurring', 'recorrente');
            $table->renameColumn('recurrence_start_date', 'recorrencia_data_inicio');
            $table->renameColumn('recurrence_end_date', 'recorrencia_data_fim');
            $table->renameColumn('recurrence_weekdays', 'recorrencia_dias_semana');
            $table->renameColumn('parent_event_id', 'evento_pai_id');
        });
    }
};
