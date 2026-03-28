<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('communication_segments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->nullable()->unique();
            $table->enum('type', ['dynamic', 'manual', 'system'])->default('dynamic');
            $table->text('description')->nullable();
            $table->json('rules_json')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('type');
            $table->index('is_active');
        });

        Schema::create('communication_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->enum('channel', ['email', 'sms', 'push', 'interno', 'alert_app']);
            $table->string('category')->nullable();
            $table->string('subject')->nullable();
            $table->longText('body');
            $table->json('variables_json')->nullable();
            $table->enum('status', ['ativo', 'em_revisao', 'inativo'])->default('ativo');
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('channel');
            $table->index('status');
        });

        Schema::create('communication_campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('codigo')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignUuid('segment_id')->nullable()->constrained('communication_segments')->nullOnDelete();
            $table->foreignUuid('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['rascunho', 'agendada', 'em_processamento', 'enviada', 'falhada', 'cancelada'])->default('rascunho');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->boolean('create_in_app_alert')->default(false);
            $table->string('alert_title')->nullable();
            $table->text('alert_message')->nullable();
            $table->string('alert_link')->nullable();
            $table->string('alert_type', 20)->default('info');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('scheduled_at');
            $table->index('sent_at');
        });

        Schema::create('communication_campaign_channels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('campaign_id')->constrained('communication_campaigns')->cascadeOnDelete();
            $table->enum('channel', ['email', 'sms', 'push', 'interno', 'alert_app']);
            $table->foreignUuid('template_id')->nullable()->constrained('communication_templates')->nullOnDelete();
            $table->string('subject')->nullable();
            $table->longText('message_body')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();

            $table->index('campaign_id');
            $table->index('channel');
        });

        Schema::create('communication_deliveries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('campaign_id')->constrained('communication_campaigns')->cascadeOnDelete();
            $table->enum('channel', ['email', 'sms', 'push', 'interno', 'alert_app']);
            $table->foreignUuid('segment_id')->nullable()->constrained('communication_segments')->nullOnDelete();
            $table->enum('status', ['pending', 'processing', 'completed', 'partial', 'failed'])->default('pending');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->unsignedInteger('total_recipients')->default(0);
            $table->unsignedInteger('success_count')->default(0);
            $table->unsignedInteger('failed_count')->default(0);
            $table->unsignedInteger('pending_count')->default(0);
            $table->text('result_summary')->nullable();
            $table->text('error_message')->nullable();
            $table->foreignUuid('executed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('campaign_id');
            $table->index('status');
            $table->index('channel');
            $table->index('sent_at');
        });

        Schema::create('communication_delivery_recipients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('delivery_id')->constrained('communication_deliveries')->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('member_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('push_token')->nullable();
            $table->enum('status', ['pending', 'sent', 'delivered', 'failed', 'read'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('delivery_id');
            $table->index('status');
            $table->index('user_id');
        });

        Schema::create('in_app_alerts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('campaign_id')->nullable()->constrained('communication_campaigns')->nullOnDelete();
            $table->foreignUuid('delivery_id')->nullable()->constrained('communication_deliveries')->nullOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('message');
            $table->string('link')->nullable();
            $table->enum('type', ['info', 'warning', 'success', 'error'])->default('info');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamp('visible_from')->nullable();
            $table->timestamp('visible_until')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('is_read');
            $table->index('type');
            $table->index('visible_from');
            $table->index('visible_until');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('in_app_alerts');
        Schema::dropIfExists('communication_delivery_recipients');
        Schema::dropIfExists('communication_deliveries');
        Schema::dropIfExists('communication_campaign_channels');
        Schema::dropIfExists('communication_campaigns');
        Schema::dropIfExists('communication_templates');
        Schema::dropIfExists('communication_segments');
    }
};
