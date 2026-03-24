<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('trainings') || Schema::hasColumn('trainings', 'mesociclo_id')) {
            return;
        }

        Schema::table('trainings', function (Blueprint $table) {
            $table->uuid('mesociclo_id')->nullable()->after('macrocycle_id');
            $table->foreign('mesociclo_id')->references('id')->on('mesocycles')->nullOnDelete();
            $table->index('mesociclo_id');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('trainings') || !Schema::hasColumn('trainings', 'mesociclo_id')) {
            return;
        }

        Schema::table('trainings', function (Blueprint $table) {
            $table->dropForeign(['mesociclo_id']);
            $table->dropIndex(['mesociclo_id']);
            $table->dropColumn('mesociclo_id');
        });
    }
};
