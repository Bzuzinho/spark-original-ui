<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('bank_statements', function (Blueprint $table) {
            if (!Schema::hasColumn('bank_statements', 'ficheiro_id')) {
                $table->string('ficheiro_id')->nullable()->after('referencia');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bank_statements', function (Blueprint $table) {
            if (Schema::hasColumn('bank_statements', 'ficheiro_id')) {
                $table->dropColumn('ficheiro_id');
            }
        });
    }
};
