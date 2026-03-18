<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('trainings') || Schema::hasColumn('trainings', 'macrocycle_id')) {
            return;
        }

        Schema::table('trainings', function (Blueprint $table) {
            $table->uuid('macrocycle_id')->nullable()->after('epoca_id');
            $table->foreign('macrocycle_id')->references('id')->on('macrocycles')->nullOnDelete();
            $table->index('macrocycle_id');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('trainings') || !Schema::hasColumn('trainings', 'macrocycle_id')) {
            return;
        }

        Schema::table('trainings', function (Blueprint $table) {
            $table->dropForeign(['macrocycle_id']);
            $table->dropIndex(['macrocycle_id']);
            $table->dropColumn('macrocycle_id');
        });
    }
};
