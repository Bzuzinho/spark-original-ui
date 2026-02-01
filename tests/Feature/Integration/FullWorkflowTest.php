<?php

namespace Tests\Feature\Integration;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Event;
use App\Models\EventType;
use App\Models\EventConvocation;
use App\Models\EventAttendance;
use App\Models\MonthlyFee;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Movement;
use App\Models\MovementItem;
use App\Models\CostCenter;
use Carbon\Carbon;

class FullWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed basic data
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    /**
     * Test complete member workflow from creation to payment
     */
    public function test_complete_member_workflow(): void
    {
        // 1. Create admin user
        $admin = User::where('email', 'admin@test.com')->first();
        $this->assertNotNull($admin);

        // 2. Create a new member
        $this->actingAs($admin);
        
        $memberData = [
            'numero_socio' => '999',
            'nome_completo' => 'Test Athlete',
            'email' => 'athlete@test.com',
            'password' => 'password123',
            'perfil' => 'atleta',
            'estado' => 'ativo',
            'data_nascimento' => '2005-05-15',
            'sexo' => 'masculino',
            'tipo_membro' => ['Atleta'],
            'menor' => true,
            'rgpd' => true,
            'consentimento' => true,
            'afiliacao' => true,
            'declaracao_de_transporte' => true,
            'ativo_desportivo' => true,
        ];

        $response = $this->post('/membros', $memberData);
        $response->assertRedirect();

        $member = User::where('email', 'athlete@test.com')->first();
        $this->assertNotNull($member);
        $this->assertEquals('Test Athlete', $member->nome_completo);
        $this->assertEquals('atleta', $member->perfil);

        // 3. Create an event
        $eventType = EventType::where('name', 'Treino')->first();
        $this->assertNotNull($eventType);

        $eventData = [
            'nome' => 'Training Session Test',
            'tipo' => $eventType->id,
            'data_inicio' => Carbon::now()->addDays(7)->format('Y-m-d H:i:s'),
            'data_fim' => Carbon::now()->addDays(7)->addHours(2)->format('Y-m-d H:i:s'),
            'local' => 'Test Venue',
            'descricao' => 'Test training session',
            'escalao' => ['Juvenis'],
        ];

        $response = $this->post('/eventos', $eventData);
        $response->assertRedirect();

        $event = Event::where('nome', 'Training Session Test')->first();
        $this->assertNotNull($event);

        // 4. Convoke member to event
        EventConvocation::create([
            'event_id' => $event->id,
            'user_id' => $member->id,
            'estado' => 'convocado',
        ]);

        $this->assertDatabaseHas('event_convocations', [
            'event_id' => $event->id,
            'user_id' => $member->id,
            'estado' => 'convocado',
        ]);

        // 5. Mark presence
        EventAttendance::create([
            'event_id' => $event->id,
            'user_id' => $member->id,
            'presente' => true,
            'justificado' => false,
        ]);

        $this->assertDatabaseHas('event_attendances', [
            'event_id' => $event->id,
            'user_id' => $member->id,
            'presente' => true,
        ]);

        // 6. Generate monthly fee
        $monthlyFee = MonthlyFee::create([
            'user_id' => $member->id,
            'mes' => now()->month,
            'ano' => now()->year,
            'valor' => 50.00,
            'estado' => 'pendente',
            'data_vencimento' => now()->addDays(10)->format('Y-m-d'),
        ]);

        $this->assertNotNull($monthlyFee);
        $this->assertEquals(50.00, $monthlyFee->valor);
        $this->assertEquals('pendente', $monthlyFee->estado);

        // 7. Generate invoice for monthly fee
        $invoice = Invoice::create([
            'numero' => 'INV-TEST-001',
            'user_id' => $member->id,
            'data_emissao' => now()->format('Y-m-d'),
            'data_vencimento' => now()->addDays(10)->format('Y-m-d'),
            'valor_total' => 50.00,
            'estado' => 'pendente',
            'notas' => 'Monthly fee test',
        ]);

        InvoiceItem::create([
            'invoice_id' => $invoice->id,
            'descricao' => 'Mensalidade ' . now()->format('F Y'),
            'quantidade' => 1,
            'preco_unitario' => 50.00,
            'total' => 50.00,
        ]);

        $this->assertDatabaseHas('invoices', [
            'numero' => 'INV-TEST-001',
            'user_id' => $member->id,
            'estado' => 'pendente',
        ]);

        // 8. Pay monthly fee
        $monthlyFee->update([
            'estado' => 'pago',
            'data_pagamento' => now()->format('Y-m-d'),
        ]);

        $invoice->update([
            'estado' => 'pago',
        ]);

        // 9. Create financial transaction for payment
        $costCenter = CostCenter::first();
        
        $movement = Movement::create([
            'data' => now()->format('Y-m-d'),
            'tipo' => 'receita',
            'categoria' => 'Mensalidades',
            'descricao' => 'Payment from ' . $member->nome_completo,
            'valor' => 50.00,
            'metodo_pagamento' => 'transferencia',
            'cost_center_id' => $costCenter->id,
        ]);

        MovementItem::create([
            'movement_id' => $movement->id,
            'descricao' => 'Monthly fee payment',
            'quantidade' => 1,
            'valor_unitario' => 50.00,
            'total' => 50.00,
        ]);

        $this->assertDatabaseHas('movements', [
            'tipo' => 'receita',
            'categoria' => 'Mensalidades',
            'valor' => 50.00,
        ]);

        // 10. Verify stats updated
        $this->assertEquals(1, Event::where('nome', 'Training Session Test')->count());
        $this->assertEquals(1, EventAttendance::where('user_id', $member->id)->where('presente', true)->count());
        $this->assertEquals(1, MonthlyFee::where('user_id', $member->id)->where('estado', 'pago')->count());
        $this->assertEquals(1, Invoice::where('user_id', $member->id)->where('estado', 'pago')->count());
        $this->assertEquals(1, Movement::where('tipo', 'receita')->where('categoria', 'Mensalidades')->count());
    }

    /**
     * Test event creation and attendance workflow
     */
    public function test_event_attendance_workflow(): void
    {
        $admin = User::where('email', 'admin@test.com')->first();
        $this->actingAs($admin);

        // Create athletes
        $athletes = User::factory()->count(5)->create([
            'perfil' => 'atleta',
            'ativo_desportivo' => true,
        ]);

        // Create event
        $eventType = EventType::first();
        $event = Event::create([
            'nome' => 'Team Practice',
            'tipo' => $eventType->id,
            'data_inicio' => Carbon::now()->addDays(3)->format('Y-m-d H:i:s'),
            'data_fim' => Carbon::now()->addDays(3)->addHours(2)->format('Y-m-d H:i:s'),
            'local' => 'Sports Hall',
            'descricao' => 'Weekly team practice',
            'escalao' => ['Juvenis'],
        ]);

        // Convoke all athletes
        foreach ($athletes as $athlete) {
            EventConvocation::create([
                'event_id' => $event->id,
                'user_id' => $athlete->id,
                'estado' => 'convocado',
            ]);
        }

        // Mark 3 present, 2 absent
        foreach ($athletes->take(3) as $athlete) {
            EventAttendance::create([
                'event_id' => $event->id,
                'user_id' => $athlete->id,
                'presente' => true,
            ]);
        }

        foreach ($athletes->skip(3) as $athlete) {
            EventAttendance::create([
                'event_id' => $event->id,
                'user_id' => $athlete->id,
                'presente' => false,
                'justificado' => true,
                'observacoes' => 'Medical excuse',
            ]);
        }

        // Verify
        $this->assertEquals(5, EventConvocation::where('event_id', $event->id)->count());
        $this->assertEquals(3, EventAttendance::where('event_id', $event->id)->where('presente', true)->count());
        $this->assertEquals(2, EventAttendance::where('event_id', $event->id)->where('presente', false)->count());
    }

    /**
     * Test financial workflow: invoice generation and payment
     */
    public function test_financial_workflow(): void
    {
        $admin = User::where('email', 'admin@test.com')->first();
        $this->actingAs($admin);

        $member = User::factory()->create([
            'perfil' => 'atleta',
        ]);

        // Generate invoice
        $invoice = Invoice::create([
            'numero' => 'INV-2024-001',
            'user_id' => $member->id,
            'data_emissao' => now()->format('Y-m-d'),
            'data_vencimento' => now()->addDays(15)->format('Y-m-d'),
            'valor_total' => 0,
            'estado' => 'pendente',
        ]);

        // Add items
        $items = [
            ['Monthly Fee', 50.00],
            ['Equipment', 25.00],
        ];

        $total = 0;
        foreach ($items as $itemData) {
            $item = InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'descricao' => $itemData[0],
                'quantidade' => 1,
                'preco_unitario' => $itemData[1],
                'total' => $itemData[1],
            ]);
            $total += $item->total;
        }

        $invoice->update(['valor_total' => $total]);

        // Verify invoice
        $this->assertEquals(75.00, $invoice->valor_total);
        $this->assertEquals(2, $invoice->items()->count());

        // Pay invoice
        $invoice->update(['estado' => 'pago']);

        // Create movement for payment
        $costCenter = CostCenter::first();
        Movement::create([
            'data' => now()->format('Y-m-d'),
            'tipo' => 'receita',
            'categoria' => 'Mensalidades',
            'descricao' => 'Invoice payment: ' . $invoice->numero,
            'valor' => $invoice->valor_total,
            'metodo_pagamento' => 'multibanco',
            'cost_center_id' => $costCenter->id,
        ]);

        // Verify payment recorded
        $this->assertEquals('pago', $invoice->fresh()->estado);
        $this->assertDatabaseHas('movements', [
            'tipo' => 'receita',
            'valor' => 75.00,
        ]);
    }

    /**
     * Test user CRUD operations
     */
    public function test_user_crud_operations(): void
    {
        $admin = User::where('email', 'admin@test.com')->first();
        $this->actingAs($admin);

        // Create
        $user = User::factory()->create([
            'numero_socio' => '500',
            'nome_completo' => 'CRUD Test User',
        ]);

        $this->assertDatabaseHas('users', [
            'numero_socio' => '500',
            'nome_completo' => 'CRUD Test User',
        ]);

        // Read
        $foundUser = User::where('numero_socio', '500')->first();
        $this->assertEquals('CRUD Test User', $foundUser->nome_completo);

        // Update
        $foundUser->update(['nome_completo' => 'Updated Name']);
        $this->assertDatabaseHas('users', [
            'numero_socio' => '500',
            'nome_completo' => 'Updated Name',
        ]);

        // Delete
        $foundUser->delete();
        $this->assertDatabaseMissing('users', [
            'numero_socio' => '500',
        ]);
    }
}
