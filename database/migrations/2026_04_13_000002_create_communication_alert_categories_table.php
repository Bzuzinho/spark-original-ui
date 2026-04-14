<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communication_alert_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('channels');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('sort_order');
            $table->index('is_active');
        });

        $now = now();

        DB::table('communication_alert_categories')->insert([
            [
                'id' => (string) Str::uuid(),
                'code' => 'mensalidade',
                'name' => 'Mensalidade',
                'description' => 'Alertas relacionados com pagamentos e quotas.',
                'channels' => json_encode(['email', 'sms', 'alert_app']),
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'code' => 'presencas',
                'name' => 'Presenças',
                'description' => 'Alertas de faltas, presenças e assiduidade.',
                'channels' => json_encode(['email', 'sms', 'alert_app']),
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'code' => 'comportamento',
                'name' => 'Comportamento',
                'description' => 'Alertas sobre comportamento e acompanhamento.',
                'channels' => json_encode(['email', 'alert_app']),
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'code' => 'geral',
                'name' => 'Geral',
                'description' => 'Comunicações gerais do clube.',
                'channels' => json_encode(['email', 'sms', 'alert_app']),
                'sort_order' => 4,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('communication_alert_categories');
    }
};