<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::table('event_convocations', function (Blueprint $table) {
            // Rename Portuguese columns to English
            $table->renameColumn('evento_id', 'event_id');
            $table->renameColumn('data_convocatoria', 'convocation_date');
            $table->renameColumn('estado_confirmacao', 'confirmation_status');
            $table->renameColumn('data_resposta', 'response_date');
            $table->renameColumn('justificacao', 'justification');
            $table->renameColumn('observacoes', 'notes');
            $table->renameColumn('transporte_clube', 'club_transport');
        });
    }

    public function down(): void
    {
        Schema::table('event_convocations', function (Blueprint $table) {
            // Reverse the column renames
            $table->renameColumn('event_id', 'evento_id');
            $table->renameColumn('convocation_date', 'data_convocatoria');
            $table->renameColumn('confirmation_status', 'estado_confirmacao');
            $table->renameColumn('response_date', 'data_resposta');
            $table->renameColumn('justification', 'justificacao');
            $table->renameColumn('notes', 'observacoes');
            $table->renameColumn('club_transport', 'transporte_clube');
        });
    }
};
