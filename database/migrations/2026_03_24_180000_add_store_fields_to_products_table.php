<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'visible_in_store')) {
                $table->boolean('visible_in_store')->default(false)->after('ativo');
                $table->index('visible_in_store');
            }

            if (!Schema::hasColumn('products', 'variant_options')) {
                $table->json('variant_options')->nullable()->after('visible_in_store');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'variant_options')) {
                $table->dropColumn('variant_options');
            }

            if (Schema::hasColumn('products', 'visible_in_store')) {
                $table->dropIndex(['visible_in_store']);
                $table->dropColumn('visible_in_store');
            }
        });
    }
};
