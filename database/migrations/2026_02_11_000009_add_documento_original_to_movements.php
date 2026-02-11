<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('movements', function (Blueprint $table) {
            if (!Schema::hasColumn('movements', 'documento_original')) {
                $table->string('documento_original')->nullable()->after('comprovativo');
            }
        });
    }

    public function down(): void
    {
        Schema::table('movements', function (Blueprint $table) {
            if (Schema::hasColumn('movements', 'documento_original')) {
                $table->dropColumn('documento_original');
            }
        });
    }
};
