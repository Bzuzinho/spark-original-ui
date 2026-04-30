<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('item_categories', function (Blueprint $table) {
            $table->string('contexto', 50)->nullable()->after('nome');
            $table->index(['contexto', 'ativo'], 'item_categories_contexto_ativo_idx');
        });
    }

    public function down(): void
    {
        Schema::table('item_categories', function (Blueprint $table) {
            $table->dropIndex('item_categories_contexto_ativo_idx');
            $table->dropColumn('contexto');
        });
    }
};