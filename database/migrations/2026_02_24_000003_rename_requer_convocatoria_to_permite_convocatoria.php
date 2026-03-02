<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('event_types', function (Blueprint $table) {
            $table->renameColumn('requer_convocatoria', 'permite_convocatoria');
            $table->boolean('gera_presencas')->default(false)->after('permite_convocatoria');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_types', function (Blueprint $table) {
            $table->renameColumn('permite_convocatoria', 'requer_convocatoria');
            $table->dropColumn('gera_presencas');
        });
    }
};
