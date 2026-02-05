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

class LojaController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query();

        // Apply filters
        if ($request->filled('category')) {
            $query->where('categoria', $request->category);
        }

        if ($request->filled('active')) {
            $query->where('ativo', $request->boolean('active'));
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

        return Inertia::render('Loja/Index', [
            'products' => $products,
            'stats' => $stats,
            'categorias' => $categorias,
            'filters' => $request->only(['category', 'active', 'low_stock']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Loja/Create');
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        Product::create($request->validated());

        return redirect()->route('shop.index')
            ->with('success', 'Produto criado com sucesso!');
    }

    public function show(Product $loja): Response
    {
        return Inertia::render('Loja/Show', [
            'product' => $loja,
        ]);
    }

    public function edit(Product $loja): Response
    {
        return Inertia::render('Loja/Edit', [
            'product' => $loja,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $loja): RedirectResponse
    {
        $loja->update($request->validated());

        return redirect()->route('shop.index')
            ->with('success', 'Produto atualizado com sucesso!');
    }

    public function destroy(Product $loja): RedirectResponse
    {
        $loja->delete();

        return redirect()->route('shop.index')
            ->with('success', 'Produto eliminado com sucesso!');
    }
}
