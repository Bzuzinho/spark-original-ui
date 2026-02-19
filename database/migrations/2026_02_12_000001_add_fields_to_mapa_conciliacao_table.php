cd<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('mapa_conciliacao', function (Blueprint $table) {
            if (!Schema::hasColumn('mapa_conciliacao', 'fatura_id')) {
                $table->uuid('fatura_id')->nullable();
            }
            if (!Schema::hasColumn('mapa_conciliacao', 'movimento_id')) {
                $table->uuid('movimento_id')->nullable();
            }
            if (!Schema::hasColumn('mapa_conciliacao', 'estado_fatura_anterior')) {
                $table->string('estado_fatura_anterior', 20)->nullable();
            }
            if (!Schema::hasColumn('mapa_conciliacao', 'estado_movimento_anterior')) {
                $table->string('estado_movimento_anterior', 20)->nullable();
            }
            if (!Schema::hasColumn('mapa_conciliacao', 'valor_conciliado')) {
                $table->decimal('valor_conciliado', 12, 2)->nullable();
            }

            $table->index('fatura_id');
            $table->index('movimento_id');
        });
    }

    public function down(): void
    {
        Schema::table('mapa_conciliacao', function (Blueprint $table) {
            $table->dropIndex(['fatura_id']);
            $table->dropIndex(['movimento_id']);
            $table->dropColumn([
                'fatura_id',
                'movimento_id',
                'estado_fatura_anterior',
                'estado_movimento_anterior',
                'valor_conciliado',
            ]);
        });
    }
};
