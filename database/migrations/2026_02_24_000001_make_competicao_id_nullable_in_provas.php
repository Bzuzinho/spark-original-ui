<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('provas', function (Blueprint $table) {
            // Make competicao_id nullable to allow standalone provas
            $table->dropForeign(['competicao_id']);
            $table->uuid('competicao_id')->nullable()->change();
            // Add it back as optional foreign key
            $table->foreign('competicao_id')->references('id')->on('competitions')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('provas', function (Blueprint $table) {
            $table->dropForeign(['competicao_id']);
            $table->uuid('competicao_id')->nullable(false)->change();
            $table->foreign('competicao_id')->references('id')->on('competitions')->onDelete('cascade');
        });
    }
};
