<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('cost_centers', function (Blueprint $table) {
            $table->string('tipo')->nullable()->after('nome');
            $table->decimal('orcamento', 12, 2)->nullable()->after('descricao');
        });
    }

    public function down(): void
    {
        Schema::table('cost_centers', function (Blueprint $table) {
            $table->dropColumn(['tipo', 'orcamento']);
        });
    }
};
