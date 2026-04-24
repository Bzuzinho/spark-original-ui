<?php

namespace Tests\Feature\Portal;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\DadosFinanceiros;
use App\Models\Invoice;
use App\Models\MonthlyFee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalPaymentsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_without_debt_sees_everything_up_to_date(): void
    {
        $user = User::factory()->create([
            'perfil' => 'user',
            'tipo_membro' => ['socio'],
            'nome_completo' => 'Utilizador Sem Divida',
        ]);

        $monthlyFee = MonthlyFee::create([
            'designacao' => 'Mensalidade Gold',
            'valor' => 35,
            'ativo' => true,
        ]);

        DadosFinanceiros::create([
            'user_id' => $user->id,
            'mensalidade_id' => $monthlyFee->id,
            'conta_corrente_manual' => 0,
        ]);

        Invoice::create([
            'user_id' => $user->id,
            'data_fatura' => now()->subDays(20)->toDateString(),
            'mes' => 'Janeiro 2026',
            'data_emissao' => now()->subDays(20)->toDateString(),
            'data_vencimento' => now()->subDays(10)->toDateString(),
            'valor_total' => 35,
            'estado_pagamento' => 'pago',
            'numero_recibo' => 'REC-2026-001',
            'tipo' => 'mensalidade',
            'oculta' => false,
        ]);

        $response = $this->inertiaGetAs($user, route('portal.payments'));

        $response->assertOk();
        $response->assertJsonPath('component', 'Portal/Payments');
        $response->assertJsonPath('props.hero.status', 'Tudo em dia');
        $response->assertJsonPath('props.account_current.outstanding_value', 0);
        $response->assertJsonPath('props.kpis.plan', 'Mensalidade Gold');
        $response->assertJsonPath('props.kpis.receipts_this_year', 1);
    }

    public function test_user_with_overdue_invoice_only_sees_own_debt(): void
    {
        $user = User::factory()->create([
            'perfil' => 'user',
            'tipo_membro' => ['socio'],
            'nome_completo' => 'Utilizador Com Divida',
        ]);

        $otherUser = User::factory()->create([
            'perfil' => 'user',
            'tipo_membro' => ['socio'],
        ]);

        Invoice::create([
            'user_id' => $user->id,
            'data_fatura' => now()->subDays(15)->toDateString(),
            'mes' => 'Fevereiro 2026',
            'data_emissao' => now()->subDays(15)->toDateString(),
            'data_vencimento' => now()->subDays(3)->toDateString(),
            'valor_total' => 42.5,
            'estado_pagamento' => 'pendente',
            'referencia_pagamento' => 'REF-ABC-123',
            'tipo' => 'mensalidade',
            'oculta' => false,
        ]);

        Invoice::create([
            'user_id' => $otherUser->id,
            'data_fatura' => now()->subDays(8)->toDateString(),
            'mes' => 'Fevereiro 2026',
            'data_emissao' => now()->subDays(8)->toDateString(),
            'data_vencimento' => now()->subDay()->toDateString(),
            'valor_total' => 999,
            'estado_pagamento' => 'pendente',
            'tipo' => 'mensalidade',
            'oculta' => false,
        ]);

        $response = $this->inertiaGetAs($user, route('portal.payments'));

        $response->assertOk();
        $response->assertJsonPath('props.hero.status', 'Pagamento pendente');
        $response->assertJsonPath('props.kpis.outstanding_value', 42.5);
        $response->assertJsonPath('props.account_current.overdue_invoices', 1);
        $response->assertJsonPath('props.movements.0.reference', 'REF-ABC-123');
        $this->assertCount(1, $response->json('props.movements'));
    }

    public function test_paid_receipts_are_listed_in_latest_receipts(): void
    {
        $user = User::factory()->create([
            'perfil' => 'user',
            'tipo_membro' => ['socio'],
        ]);

        Invoice::create([
            'user_id' => $user->id,
            'data_fatura' => now()->subDays(12)->toDateString(),
            'mes' => 'Março 2026',
            'data_emissao' => now()->subDays(12)->toDateString(),
            'data_vencimento' => now()->subDays(2)->toDateString(),
            'valor_total' => 50,
            'estado_pagamento' => 'pago',
            'numero_recibo' => 'REC-2026-010',
            'tipo' => 'mensalidade',
            'oculta' => false,
        ]);

        $response = $this->inertiaGetAs($user, route('portal.payments'));

        $response->assertOk();
        $response->assertJsonPath('props.hero.actions.can_view_receipts', true);
        $response->assertJsonPath('props.latest_receipts.0.receipt_number', 'REC-2026-010');
        $response->assertJsonPath('props.latest_receipts.0.can_view_receipt', true);
    }

    private function inertiaGetAs(User $user, string $uri)
    {
        $inertiaVersion = app(HandleInertiaRequests::class)->version(request());

        return $this->actingAs($user)->withHeaders([
            'X-Inertia' => 'true',
            'X-Requested-With' => 'XMLHttpRequest',
            'X-Inertia-Version' => (string) $inertiaVersion,
        ])->get($uri);
    }
}