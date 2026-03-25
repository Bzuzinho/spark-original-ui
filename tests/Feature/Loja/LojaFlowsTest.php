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
}
