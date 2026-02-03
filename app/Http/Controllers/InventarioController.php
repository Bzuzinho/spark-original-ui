<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Controller para gestão de inventário
 * Gere produtos, stock e vendas
 */
class InventarioController extends Controller
{
    /**
     * Exibe a página principal de gestão de inventário
     */
    public function index(Request $request): Response
    {
        $query = Product::query();

        // Apply filters
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('active')) {
            $query->where('active', $request->boolean('active'));
        }

        if ($request->boolean('low_stock')) {
            $query->lowStock();
        }

        $products = $query->latest()->get();

        // Calculate stats
        $stats = [
            'total_produtos' => Product::count(),
            'valor_total_stock' => Product::sum(DB::raw('price * stock')),
            'produtos_baixo_stock' => Product::lowStock()->count(),
        ];

        // Get unique categories
        $categorias = Product::whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values();

        return Inertia::render('Inventario/Index', [
            'products' => $products,
            'stats' => $stats,
            'categorias' => $categorias,
            'filters' => $request->only(['category', 'active', 'low_stock']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Inventario/Create');
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        Product::create($request->validated());

        return redirect()->route('inventario.index')
            ->with('success', 'Produto criado com sucesso!');
    }

    public function show(Product $inventario): Response
    {
        return Inertia::render('Inventario/Show', [
            'product' => $inventario,
        ]);
    }

    public function edit(Product $inventario): Response
    {
        return Inertia::render('Inventario/Edit', [
            'product' => $inventario,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $inventario): RedirectResponse
    {
        $inventario->update($request->validated());

        return redirect()->route('inventario.index')
            ->with('success', 'Produto atualizado com sucesso!');
    }

    public function destroy(Product $inventario): RedirectResponse
    {
        $inventario->delete();

        return redirect()->route('inventario.index')
            ->with('success', 'Produto eliminado com sucesso!');
    }
}
