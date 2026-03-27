<?php

namespace Tests\Feature\Loja;

use App\Models\Invoice;
use App\Models\Product;
use App\Models\StoreCartItem;
use App\Models\StoreOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LojaFlowsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guardian_can_order_for_educando_with_finance_and_stock_integration(): void
    {
        $guardian = User::factory()->create();
        $athlete = User::factory()->athlete()->create();

        DB::table('user_guardian')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $athlete->id,
            'guardian_id' => $guardian->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $product = Product::create([
            'codigo' => 'LOJA-001',
            'nome' => 'T-Shirt Clube',
            'categoria' => 'Merchandising',
            'descricao' => 'Camisola oficial',
            'preco' => 20.00,
            'stock' => 10,
            'stock_reservado' => 0,
            'stock_minimo' => 1,
            'ativo' => true,
            'visible_in_store' => true,
            'variant_options' => ['S', 'M', 'L'],
        ]);

        $this->actingAs($guardian)
            ->post(route('loja.cart.store'), [
                'article_id' => $product->id,
                'target_user_id' => $athlete->id,
                'variant' => 'M',
                'quantity' => 2,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('store_cart_items', [
            'user_id' => $guardian->id,
            'target_user_id' => $athlete->id,
            'article_id' => $product->id,
            'variant' => 'M',
            'quantity' => 2,
        ]);

        $this->actingAs($guardian)
            ->post(route('loja.orders.store'), [
                'target_user_id' => $athlete->id,
                'notes' => 'Entrega no treino',
            ])
            ->assertRedirect();

        $order = StoreOrder::query()->latest()->firstOrFail();

        $this->assertSame($guardian->id, $order->user_id);
        $this->assertSame($athlete->id, $order->target_user_id);
        $this->assertSame('pending_payment', $order->status);
        $this->assertSame('40.00', (string) $order->total);
        $this->assertNotNull($order->financial_invoice_id);

        $invoice = Invoice::query()->findOrFail($order->financial_invoice_id);
        $this->assertSame($athlete->id, $invoice->user_id);
        $this->assertSame('store_order', $invoice->origem_tipo);
        $this->assertSame($order->id, $invoice->origem_id);

        $product->refresh();
        $this->assertSame(8, (int) $product->stock);

        $this->assertDatabaseHas('stock_movements', [
            'article_id' => $product->id,
            'movement_type' => 'exit',
            'reference_type' => 'store_order',
            'reference_id' => $order->id,
        ]);

        $this->assertDatabaseMissing('store_cart_items', [
            'user_id' => $guardian->id,
            'article_id' => $product->id,
        ]);
    }

    public function test_user_cannot_buy_for_unrelated_profile(): void
    {
        $buyer = User::factory()->create();
        $other = User::factory()->athlete()->create();

        $product = Product::create([
            'codigo' => 'LOJA-002',
            'nome' => 'Touca Clube',
            'categoria' => 'Merchandising',
            'preco' => 8.00,
            'stock' => 10,
            'stock_reservado' => 0,
            'stock_minimo' => 1,
            'ativo' => true,
            'visible_in_store' => true,
        ]);

        $this->actingAs($buyer)
            ->from(route('loja.index'))
            ->post(route('loja.cart.store'), [
                'article_id' => $product->id,
                'target_user_id' => $other->id,
                'quantity' => 1,
            ])
            ->assertRedirect(route('loja.index'))
            ->assertSessionHasErrors('target_user_id');

        $this->assertDatabaseMissing('store_cart_items', [
            'user_id' => $buyer->id,
            'article_id' => $product->id,
        ]);
    }

    public function test_user_cannot_add_quantity_above_available_stock(): void
    {
        $buyer = User::factory()->create();

        $product = Product::create([
            'codigo' => 'LOJA-003',
            'nome' => 'Calcoes Clube',
            'categoria' => 'Equipamento',
            'preco' => 15.00,
            'stock' => 3,
            'stock_reservado' => 1,
            'stock_minimo' => 1,
            'ativo' => true,
            'visible_in_store' => true,
        ]);

        $this->actingAs($buyer)
            ->from(route('loja.index'))
            ->post(route('loja.cart.store'), [
                'article_id' => $product->id,
                'quantity' => 5,
            ])
            ->assertRedirect(route('loja.index'))
            ->assertSessionHasErrors('quantity');

        $this->assertDatabaseMissing('store_cart_items', [
            'user_id' => $buyer->id,
            'article_id' => $product->id,
        ]);

        $this->assertCount(0, StoreCartItem::query()->get());
    }

    public function test_admin_can_update_pending_order_and_sync_finance_and_stock(): void
    {
        $guardian = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $athlete = User::factory()->athlete()->create();

        DB::table('user_guardian')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $athlete->id,
            'guardian_id' => $guardian->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $product = Product::create([
            'codigo' => 'LOJA-004',
            'nome' => 'Sweat Clube',
            'categoria' => 'Merchandising',
            'preco' => 25.00,
            'stock' => 10,
            'stock_reservado' => 0,
            'stock_minimo' => 1,
            'ativo' => true,
            'visible_in_store' => true,
        ]);

        $this->actingAs($guardian)->post(route('loja.cart.store'), [
            'article_id' => $product->id,
            'target_user_id' => $athlete->id,
            'quantity' => 2,
        ])->assertRedirect();

        $this->actingAs($guardian)->post(route('loja.orders.store'), [
            'target_user_id' => $athlete->id,
            'notes' => 'Pedido inicial',
        ])->assertRedirect();

        $order = StoreOrder::query()->with('items')->latest()->firstOrFail();
        $orderItem = $order->items->firstOrFail();

        $this->actingAs($admin)
            ->put(route('loja.orders.update', $order), [
                'notes' => 'Pedido revisto pelo admin',
                'items' => [
                    [
                        'id' => $orderItem->id,
                        'quantity' => 3,
                    ],
                ],
            ])
            ->assertRedirect();

        $order->refresh();
        $orderItem->refresh();
        $product->refresh();

        $this->assertSame('75.00', (string) $order->total);
        $this->assertSame('Pedido revisto pelo admin', $order->notes);
        $this->assertSame(3, (int) $orderItem->quantity);
        $this->assertSame('75.00', (string) $orderItem->line_total);
        $this->assertSame(7, (int) $product->stock);

        $invoice = Invoice::query()->findOrFail($order->financial_invoice_id);
        $this->assertSame('75.00', (string) $invoice->valor_total);
        $this->assertDatabaseHas('invoice_items', [
            'fatura_id' => $invoice->id,
            'produto_id' => $product->id,
            'quantidade' => 3,
            'total_linha' => 75.00,
        ]);

        $this->assertDatabaseCount('stock_movements', 1);
        $this->assertDatabaseHas('stock_movements', [
            'article_id' => $product->id,
            'movement_type' => 'exit',
            'reference_type' => 'store_order',
            'reference_id' => $order->id,
            'quantity' => 3,
        ]);
    }

    public function test_admin_can_delete_pending_order_and_restore_stock_and_financial_records(): void
    {
        $buyer = User::factory()->create();
        $admin = User::factory()->admin()->create();

        $product = Product::create([
            'codigo' => 'LOJA-005',
            'nome' => 'Casaco Clube',
            'categoria' => 'Merchandising',
            'preco' => 30.00,
            'stock' => 8,
            'stock_reservado' => 0,
            'stock_minimo' => 1,
            'ativo' => true,
            'visible_in_store' => true,
        ]);

        $this->actingAs($buyer)->post(route('loja.cart.store'), [
            'article_id' => $product->id,
            'quantity' => 2,
        ])->assertRedirect();

        $this->actingAs($buyer)->post(route('loja.orders.store'), [
            'notes' => 'Pedido para apagar',
        ])->assertRedirect();

        $order = StoreOrder::query()->with('items')->latest()->firstOrFail();
        $invoiceId = $order->financial_invoice_id;

        $this->actingAs($admin)
            ->delete(route('loja.orders.destroy', $order))
            ->assertRedirect();

        $product->refresh();

        $this->assertDatabaseMissing('store_orders', ['id' => $order->id]);
        $this->assertDatabaseMissing('store_order_items', ['store_order_id' => $order->id]);
        $this->assertDatabaseMissing('invoices', ['id' => $invoiceId]);
        $this->assertDatabaseMissing('stock_movements', [
            'reference_type' => 'store_order',
            'reference_id' => $order->id,
        ]);
        $this->assertSame(8, (int) $product->stock);
    }

    public function test_non_admin_cannot_update_or_delete_pending_order(): void
    {
        $buyer = User::factory()->create();
        $otherUser = User::factory()->athlete()->create();

        $product = Product::create([
            'codigo' => 'LOJA-006',
            'nome' => 'Polo Clube',
            'categoria' => 'Merchandising',
            'preco' => 18.00,
            'stock' => 6,
            'stock_reservado' => 0,
            'stock_minimo' => 1,
            'ativo' => true,
            'visible_in_store' => true,
        ]);

        $this->actingAs($buyer)->post(route('loja.cart.store'), [
            'article_id' => $product->id,
            'quantity' => 1,
        ])->assertRedirect();

        $this->actingAs($buyer)->post(route('loja.orders.store'), [
            'notes' => 'Pedido protegido',
        ])->assertRedirect();

        $order = StoreOrder::query()->with('items')->latest()->firstOrFail();
        $orderItem = $order->items->firstOrFail();

        $this->actingAs($otherUser)
            ->put(route('loja.orders.update', $order), [
                'notes' => 'Tentativa invalida',
                'items' => [
                    ['id' => $orderItem->id, 'quantity' => 2],
                ],
            ])
            ->assertForbidden();

        $this->actingAs($otherUser)
            ->delete(route('loja.orders.destroy', $order))
            ->assertForbidden();

        $order->refresh();
        $orderItem->refresh();
        $product->refresh();

        $this->assertSame('Pedido protegido', $order->notes);
        $this->assertSame(1, (int) $orderItem->quantity);
        $this->assertSame(5, (int) $product->stock);
        $this->assertDatabaseHas('store_orders', ['id' => $order->id]);
    }
}
