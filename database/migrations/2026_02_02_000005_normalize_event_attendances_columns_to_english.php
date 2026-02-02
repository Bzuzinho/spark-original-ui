<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::table('event_attendances', function (Blueprint $table) {
            // Rename Portuguese columns to English
            $table->renameColumn('evento_id', 'event_id');
            $table->renameColumn('estado', 'status');
            $table->renameColumn('hora_chegada', 'arrival_time');
            $table->renameColumn('observacoes', 'notes');
            $table->renameColumn('registado_por', 'registered_by');
            $table->renameColumn('registado_em', 'registered_at');
        });
    }

    public function down(): void
    {
        Schema::table('event_attendances', function (Blueprint $table) {
            // Reverse the column renames
            $table->renameColumn('event_id', 'evento_id');
            $table->renameColumn('status', 'estado');
            $table->renameColumn('arrival_time', 'hora_chegada');
            $table->renameColumn('notes', 'observacoes');
            $table->renameColumn('registered_by', 'registado_por');
            $table->renameColumn('registered_at', 'registado_em');
        });
    }
};
