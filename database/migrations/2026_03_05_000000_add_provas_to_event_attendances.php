<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('event_attendances', function (Blueprint $table) {
            $table->json('provas')->nullable()->after('estado');
        });
    }

    public function down(): void
    {
        Schema::table('event_attendances', function (Blueprint $table) {
            $table->dropColumn('provas');
        });
    }
};
