<?php

namespace Tests\Feature\Logistica;

use App\Models\EquipmentLoan;
use App\Models\FinancialEntry;
use App\Models\Invoice;
use App\Models\LogisticsRequest;
use App\Models\Movement;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\SupplierPurchase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LogisticaFlowsTest extends TestCase
{
    use RefreshDatabase;

    public function test_requisition_flow_reserves_invoices_and_delivers_stock(): void
    {
        $admin = User::factory()->create();
        $requester = User::factory()->athlete()->create();

        $product = Product::create([
            'codigo' => 'ART-REQ-01',
            'nome' => 'Prancha Treino',
            'categoria' => 'Material',
            'preco' => 10.50,
            'stock' => 20,
            'stock_reservado' => 0,
            'stock_minimo' => 3,
            'ativo' => true,
        ]);

        $this->actingAs($admin)
            ->post(route('logistica.requisicoes.store'), [
                'requester_user_id' => $requester->id,
                'requester_name_snapshot' => $requester->nome_completo,
                'requester_area' => 'Natação',
                'requester_type' => 'athlete',
                'status' => 'pending',
                'items' => [
                    [
                        'article_id' => $product->id,
                        'quantity' => 4,
                        'unit_price' => 10.50,
                    ],
                ],
            ])
            ->assertRedirect(route('logistica.index'));

        $request = LogisticsRequest::query()->latest()->firstOrFail();

        $this->actingAs($admin)
            ->post(route('logistica.requisicoes.approve', $request->id))
            ->assertRedirect(route('logistica.index'));

        $product->refresh();
        $request->refresh();

        $this->assertSame('approved', $request->status);
        $this->assertSame(20, (int) $product->stock);
        $this->assertSame(4, (int) $product->stock_reservado);

        $this->actingAs($admin)
            ->post(route('logistica.requisicoes.invoice', $request->id), [
                'tipo' => 'material',
            ])
            ->assertRedirect(route('logistica.index'));

        $request->refresh();
        $this->assertSame('invoiced', $request->status);
        $this->assertNotNull($request->financial_invoice_id);
        $this->assertDatabaseHas('invoice_items', [
            'fatura_id' => $request->financial_invoice_id,
            'produto_id' => $product->id,
            'quantidade' => 4,
        ]);

        $this->actingAs($admin)
            ->post(route('logistica.requisicoes.deliver', $request->id))
            ->assertRedirect(route('logistica.index'));

        $product->refresh();
        $request->refresh();

        $this->assertSame('delivered', $request->status);
        $this->assertSame(16, (int) $product->stock);
        $this->assertSame(0, (int) $product->stock_reservado);

        $invoice = Invoice::find($request->financial_invoice_id);
        $this->assertNotNull($invoice);
        $this->assertSame($requester->id, $invoice->user_id);
    }

    public function test_supplier_purchase_flow_updates_stock_and_finance(): void
    {
        $admin = User::factory()->create();

        $supplier = Supplier::create([
            'nome' => 'Fornecedor Equipamentos SA',
            'nif' => '509999990',
            'email' => 'fornecedor@example.com',
            'telefone' => '912345678',
            'categoria' => 'Equipamentos',
            'ativo' => true,
        ]);

        $product = Product::create([
            'codigo' => 'ART-COMP-01',
            'nome' => 'Palas Técnicas',
            'categoria' => 'Equipamento',
            'preco' => 25.00,
            'stock' => 2,
            'stock_reservado' => 0,
            'stock_minimo' => 1,
            'supplier_id' => $supplier->id,
            'ativo' => true,
        ]);

        $this->actingAs($admin)
            ->post(route('logistica.fornecedores.compras.store'), [
                'supplier_id' => $supplier->id,
                'invoice_reference' => 'FAC-2026-009',
                'invoice_date' => now()->toDateString(),
                'items' => [
                    [
                        'article_id' => $product->id,
                        'quantity' => 5,
                        'unit_cost' => 12.40,
                    ],
                ],
            ])
            ->assertRedirect(route('logistica.index'));

        $purchase = SupplierPurchase::query()->latest()->firstOrFail();
        $product->refresh();

        $this->assertSame(7, (int) $product->stock);
        $this->assertNotNull($purchase->financial_movement_id);
        $this->assertNotNull($purchase->financial_entry_id);

        $movement = Movement::find($purchase->financial_movement_id);
        $entry = FinancialEntry::find($purchase->financial_entry_id);

        $this->assertNotNull($movement);
        $this->assertNotNull($entry);
        $this->assertSame('despesa', $movement->classificacao);
        $this->assertSame('stock', $movement->origem_tipo);
        $this->assertSame('despesa', $entry->tipo);
        $this->assertSame('stock', $entry->origem_tipo);
        $this->assertDatabaseHas('stock_movements', [
            'article_id' => $product->id,
            'movement_type' => 'entry',
            'reference_type' => 'supplier_purchase',
            'reference_id' => $purchase->id,
        ]);
    }

    public function test_equipment_loan_flow_exits_and_returns_stock(): void
    {
        $admin = User::factory()->create();
        $borrower = User::factory()->create();

        $product = Product::create([
            'codigo' => 'ART-EMP-01',
            'nome' => 'Corda Elástica',
            'categoria' => 'Treino Seco',
            'preco' => 9.99,
            'stock' => 6,
            'stock_reservado' => 0,
            'stock_minimo' => 1,
            'ativo' => true,
        ]);

        $this->actingAs($admin)
            ->post(route('logistica.emprestimos.store'), [
                'borrower_user_id' => $borrower->id,
                'borrower_name_snapshot' => $borrower->nome_completo,
                'article_id' => $product->id,
                'quantity' => 2,
                'loan_date' => now()->toDateString(),
                'due_date' => now()->addDays(7)->toDateString(),
            ])
            ->assertRedirect(route('logistica.index'));

        $loan = EquipmentLoan::query()->latest()->firstOrFail();
        $product->refresh();

        $this->assertSame('active', $loan->status);
        $this->assertSame(4, (int) $product->stock);

        $this->actingAs($admin)
            ->post(route('logistica.emprestimos.return', $loan->id))
            ->assertRedirect(route('logistica.index'));

        $loan->refresh();
        $product->refresh();

        $this->assertSame('returned', $loan->status);
        $this->assertNotNull($loan->return_date);
        $this->assertSame(6, (int) $product->stock);

        $this->assertDatabaseHas('stock_movements', [
            'article_id' => $product->id,
            'movement_type' => 'exit',
            'reference_type' => 'equipment_loan',
            'reference_id' => $loan->id,
        ]);

        $this->assertDatabaseHas('stock_movements', [
            'article_id' => $product->id,
            'movement_type' => 'return',
            'reference_type' => 'equipment_loan',
            'reference_id' => $loan->id,
        ]);
    }
}
