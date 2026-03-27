<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('sponsorships', function (Blueprint $table) {
            $table->uuid('sponsor_id')->nullable()->after('sponsor_name');
            $table->foreign('sponsor_id')->references('id')->on('sponsors')->nullOnDelete();
            $table->index('sponsor_id');
        });

        $sponsorships = DB::table('sponsorships')
            ->select('id', 'sponsor_name', 'start_date', 'end_date', 'status')
            ->whereNull('sponsor_id')
            ->whereNotNull('sponsor_name')
            ->get();

        foreach ($sponsorships as $sponsorship) {
            $sponsor = DB::table('sponsors')
                ->where('nome', $sponsorship->sponsor_name)
                ->first();

            if (!$sponsor) {
                $now = now();
                $sponsorId = (string) Str::uuid();

                DB::table('sponsors')->insert([
                    'id' => $sponsorId,
                    'nome' => $sponsorship->sponsor_name,
                    'descricao' => null,
                    'logo' => null,
                    'website' => null,
                    'contacto' => null,
                    'email' => null,
                    'tipo' => 'secundario',
                    'valor_anual' => null,
                    'data_inicio' => $sponsorship->start_date ?? $now->toDateString(),
                    'data_fim' => $sponsorship->end_date,
                    'estado' => $this->mapSponsorStatus($sponsorship->status, $sponsorship->end_date),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                $sponsor = (object) ['id' => $sponsorId];
            }

            DB::table('sponsorships')
                ->where('id', $sponsorship->id)
                ->update(['sponsor_id' => $sponsor->id]);
        }
    }

    public function down(): void
    {
        Schema::table('sponsorships', function (Blueprint $table) {
            $table->dropForeign(['sponsor_id']);
            $table->dropIndex(['sponsor_id']);
            $table->dropColumn('sponsor_id');
        });
    }

    private function mapSponsorStatus(?string $sponsorshipStatus, ?string $endDate): string
    {
        if ($endDate && $endDate < now()->toDateString()) {
            return 'expirado';
        }

        return $sponsorshipStatus === 'cancelado' ? 'inativo' : 'ativo';
    }
};