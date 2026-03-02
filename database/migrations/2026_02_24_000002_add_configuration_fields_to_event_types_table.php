<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('event_types', function (Blueprint $table) {
            // Add missing fields for complete event type configuration
            $table->string('icon')->nullable()->after('color');
            $table->string('visibilidade_default', 20)->default('publico')->after('icon');
            $table->boolean('gera_taxa')->default(false)->after('visibilidade_default');
            $table->boolean('requer_convocatoria')->default(false)->after('gera_taxa');
            $table->boolean('requer_transporte')->default(false)->after('requer_convocatoria');
        });
    }

    public function down(): void
    {
        Schema::table('event_types', function (Blueprint $table) {
            $table->dropColumn(['icon', 'visibilidade_default', 'gera_taxa', 'requer_convocatoria', 'requer_transporte']);
        });
    }
};
