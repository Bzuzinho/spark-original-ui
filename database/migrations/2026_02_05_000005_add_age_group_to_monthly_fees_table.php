<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('monthly_fees', function (Blueprint $table) {
            $table->foreignUuid('age_group_id')->nullable()->after('valor')->constrained('age_groups')->nullOnDelete();
            $table->index('age_group_id');
        });
    }

    public function down(): void
    {
        Schema::table('monthly_fees', function (Blueprint $table) {
            $table->dropForeign(['age_group_id']);
            $table->dropIndex(['age_group_id']);
            $table->dropColumn('age_group_id');
        });
    }
};
