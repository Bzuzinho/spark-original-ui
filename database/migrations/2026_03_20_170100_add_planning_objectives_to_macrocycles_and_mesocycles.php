<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('macrocycles', function (Blueprint $table) {
            $table->string('objetivo_principal')->nullable()->after('data_fim');
            $table->string('objetivo_secundario')->nullable()->after('objetivo_principal');
        });

        Schema::table('mesocycles', function (Blueprint $table) {
            $table->string('objetivo_principal')->nullable()->after('data_fim');
            $table->string('objetivo_secundario')->nullable()->after('objetivo_principal');
        });
    }

    public function down(): void
    {
        Schema::table('mesocycles', function (Blueprint $table) {
            $table->dropColumn(['objetivo_principal', 'objetivo_secundario']);
        });

        Schema::table('macrocycles', function (Blueprint $table) {
            $table->dropColumn(['objetivo_principal', 'objetivo_secundario']);
        });
    }
};
