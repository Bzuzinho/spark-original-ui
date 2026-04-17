<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('user_type_permissions')) {
            return;
        }

        Schema::table('user_type_permissions', function (Blueprint $table) {
            if (! Schema::hasColumn('user_type_permissions', 'permission_node_id')) {
                $table->foreignUuid('permission_node_id')->nullable()->after('user_type_id')->constrained('permission_nodes')->nullOnDelete();
            }

            if (! Schema::hasColumn('user_type_permissions', 'can_view')) {
                $table->boolean('can_view')->default(false)->after('permission_node_id');
            }

            if (! Schema::hasColumn('user_type_permissions', 'can_edit')) {
                $table->boolean('can_edit')->default(false)->after('can_view');
            }

            if (! Schema::hasColumn('user_type_permissions', 'can_delete')) {
                $table->boolean('can_delete')->default(false)->after('can_edit');
            }
        });

        Schema::table('user_type_permissions', function (Blueprint $table) {
            $table->unique(['user_type_id', 'permission_node_id'], 'user_type_permissions_node_unique');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('user_type_permissions')) {
            return;
        }

        Schema::table('user_type_permissions', function (Blueprint $table) {
            $table->dropUnique('user_type_permissions_node_unique');

            if (Schema::hasColumn('user_type_permissions', 'permission_node_id')) {
                $table->dropConstrainedForeignId('permission_node_id');
            }

            if (Schema::hasColumn('user_type_permissions', 'can_view')) {
                $table->dropColumn('can_view');
            }

            if (Schema::hasColumn('user_type_permissions', 'can_edit')) {
                $table->dropColumn('can_edit');
            }

            if (Schema::hasColumn('user_type_permissions', 'can_delete')) {
                $table->dropColumn('can_delete');
            }
        });
    }
};