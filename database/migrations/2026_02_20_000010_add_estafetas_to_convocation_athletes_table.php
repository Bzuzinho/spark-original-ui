<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::table('convocation_athletes', function (Blueprint $table) {
            if (!Schema::hasColumn('convocation_athletes', 'estafetas')) {
                $table->integer('estafetas')->nullable()->default(0);
            }
        });
    }

    public function down(): void
    {
        Schema::table('convocation_athletes', function (Blueprint $table) {
            if (Schema::hasColumn('convocation_athletes', 'estafetas')) {
                $table->dropColumn('estafetas');
            }
        });
    }
};
