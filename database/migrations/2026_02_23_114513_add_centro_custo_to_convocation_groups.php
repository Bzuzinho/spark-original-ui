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
        Schema::table('convocation_groups', function (Blueprint $table) {
            $table->string('centro_custo_id')->nullable()->after('movimento_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('convocation_groups', function (Blueprint $table) {
            $table->dropColumn('centro_custo_id');
        });
    }
};
