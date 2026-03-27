<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StoreCartItem;
use App\Models\StoreOrder;
use App\Models\User;
use App\Services\Loja\StoreProfileResolver;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    public function __construct(
        private StoreProfileResolver $profileResolver
    ) {
    }

    public function index(Request $request): Response
    {
        return $this->renderPage($request, 'loja');
    }

    public function orders(Request $request): Response
    {
        return $this->renderPage($request, 'pedidos');
    }

    private function renderPage(Request $request, string $activeTab): Response
    {
        /** @var User $authUser */
        $authUser = $request->user();

        $profiles = $this->profileResolver->allowedProfiles($authUser);
        $selectedTargetId = $request->query('target_user_id') ?: $authUser->id;

        if (!$profiles->pluck('id')->contains($selectedTargetId)) {
            $selectedTargetId = $authUser->id;
        }

        $normalizedTargetUserId = $selectedTargetId === $authUser->id ? null : $selectedTargetId;

        $search = trim((string) $request->query('search', ''));
        $category = $request->query('category');

        $productsQuery = Product::query()
            ->where('ativo', true)
            ->where('visible_in_store', true)
            ->orderBy('nome');

        if ($category) {
            $productsQuery->where('categoria', $category);
        }

        if ($search !== '') {
            $productsQuery->where(function ($query) use ($search) {
                $query->where('nome', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('descricao', 'like', "%{$search}%");
            });
        }

        $products = $productsQuery->get()->map(function (Product $product) {
            $totalStock = (int) $product->stock;

            return [
                'id' => $product->id,
                'codigo' => $product->codigo,
                'nome' => $product->nome,
                'categoria' => $product->categoria,
                'descricao' => $product->descricao,
                'imagem' => $product->imagem,
                'preco' => (float) $product->preco,
                'stock_available' => $totalStock,
                'variant_options' => array_values(array_filter((array) ($product->variant_options ?? []))),
                'ativo' => (bool) $product->ativo,
                'visible_in_store' => (bool) ($product->visible_in_store ?? false),
            ];
        })->values();

        $categories = Product::query()
            ->where('ativo', true)
            ->where('visible_in_store', true)
            ->whereNotNull('categoria')
            ->distinct()
            ->orderBy('categoria')
            ->pluck('categoria')
            ->values();

        $cartItems = StoreCartItem::query()
            ->with('article:id,codigo,nome,preco,stock,stock_reservado,variant_options,imagem')
            ->where('user_id', $authUser->id)
            ->where(function ($query) use ($normalizedTargetUserId) {
                if ($normalizedTargetUserId === null) {
                    $query->whereNull('target_user_id');
                    return;
                }

                $query->where('target_user_id', $normalizedTargetUserId);
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(function (StoreCartItem $item) {
                $product = $item->article;
                $unitPrice = (float) ($product?->preco ?? 0);

                return [
                    'id' => $item->id,
                    'article_id' => $item->article_id,
                    'variant' => $item->variant,
                    'quantity' => (int) $item->quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $unitPrice * (int) $item->quantity,
                    'article' => $product ? [
                        'id' => $product->id,
                        'codigo' => $product->codigo,
                        'nome' => $product->nome,
                        'imagem' => $product->imagem,
                        'stock_available' => (int) $product->stock,
                    ] : null,
                ];
            })
            ->values();

        $cartSubtotal = (float) $cartItems->sum('line_total');

        $allowedTargetIds = $profiles->pluck('id')->all();

        $ordersQuery = StoreOrder::query()
            ->with(['items', 'financialInvoice:id,valor_total,estado_pagamento', 'user:id,nome_completo', 'targetUser:id,nome_completo']);

        if ($authUser->perfil !== 'admin') {
            $ordersQuery->where(function ($query) use ($authUser, $allowedTargetIds) {
                $query->where('user_id', $authUser->id)
                    ->orWhereIn('target_user_id', $allowedTargetIds);
            });
        }

        $orders = $ordersQuery
            ->latest()
            ->limit(100)
            ->get()
            ->map(function (StoreOrder $order) {
                return [
                    'id' => $order->id,
                    'status' => $order->status,
                    'subtotal' => (float) $order->subtotal,
                    'total' => (float) $order->total,
                    'notes' => $order->notes,
                    'created_at' => $order->created_at?->toDateTimeString(),
                    'user' => $order->user ? [
                        'id' => $order->user->id,
                        'nome_completo' => $order->user->nome_completo,
                    ] : null,
                    'target_user' => $order->targetUser ? [
                        'id' => $order->targetUser->id,
                        'nome_completo' => $order->targetUser->nome_completo,
                    ] : null,
                    'financial_invoice' => $order->financialInvoice ? [
                        'id' => $order->financialInvoice->id,
                        'valor_total' => (float) $order->financialInvoice->valor_total,
                        'estado_pagamento' => $order->financialInvoice->estado_pagamento,
                    ] : null,
                    'items' => $order->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'article_code_snapshot' => $item->article_code_snapshot,
                            'article_name_snapshot' => $item->article_name_snapshot,
                            'variant_snapshot' => $item->variant_snapshot,
                            'quantity' => (int) $item->quantity,
                            'unit_price' => (float) $item->unit_price,
                            'line_total' => (float) $item->line_total,
                        ];
                    })->values(),
                ];
            })
            ->values();

        return Inertia::render('Loja/Index', [
            'activeTab' => $activeTab,
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category' => $category,
            ],
            'profiles' => $profiles->map(function (User $profile) use ($authUser) {
                return [
                    'id' => $profile->id,
                    'nome_completo' => $profile->nome_completo,
                    'is_self' => $profile->id === $authUser->id,
                ];
            })->values(),
            'selectedProfileId' => $selectedTargetId,
            'cart' => [
                'items' => $cartItems,
                'subtotal' => $cartSubtotal,
                'total' => $cartSubtotal,
            ],
            'orders' => $orders,
            'canManagePendingOrders' => $authUser->perfil === 'admin',
            'statusLabels' => [
                'pending_payment' => 'Pendente pagamento',
                'paid' => 'Pago',
                'preparing' => 'Em preparação',
                'ready_for_pickup' => 'Disponível para entrega',
                'delivered' => 'Entregue',
                'cancelled' => 'Cancelado',
            ],
        ]);
    }
}
