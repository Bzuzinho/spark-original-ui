<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internal_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('sender_id')->constrained('users')->cascadeOnDelete();
            $table->uuid('parent_id')->nullable();
            $table->string('subject');
            $table->longText('message');
            $table->enum('type', ['info', 'warning', 'success', 'error'])->default('info');
            $table->timestamp('sender_deleted_at')->nullable();
            $table->timestamps();

            $table->index(['sender_id', 'created_at']);
            $table->index(['parent_id', 'created_at']);
        });

        Schema::table('internal_messages', function (Blueprint $table) {
            $table->foreign('parent_id')
                ->references('id')
                ->on('internal_messages')
                ->nullOnDelete();
        });

        Schema::create('internal_message_recipients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('internal_message_id')->constrained('internal_messages')->cascadeOnDelete();
            $table->foreignUuid('recipient_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('in_app_alert_id')->nullable()->constrained('in_app_alerts')->nullOnDelete();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();

            $table->unique(['internal_message_id', 'recipient_id']);
            $table->index(['recipient_id', 'is_read', 'created_at']);
            $table->index(['recipient_id', 'deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internal_message_recipients');
        Schema::dropIfExists('internal_messages');
    }
};