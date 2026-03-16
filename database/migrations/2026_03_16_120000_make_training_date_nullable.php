<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trainings', function (Blueprint $table) {
            $table->date('data')->nullable()->change();
        });
    }

    public function down(): void
    {
        DB::table('trainings')
            ->whereNull('data')
            ->update(['data' => now()->toDateString()]);

        Schema::table('trainings', function (Blueprint $table) {
            $table->date('data')->nullable(false)->change();
        });
    }
};
