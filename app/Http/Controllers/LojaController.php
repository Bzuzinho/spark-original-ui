<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class LojaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Loja/Index', [
            'products' => Product::with(['category'])
                ->latest()
                ->paginate(15),
            'categories' => ProductCategory::where('active', true)->get(),
            'stats' => [
                'totalProducts' => Product::count(),
                'activeProducts' => Product::where('estado', 'ativo')->count(),
                'lowStockProducts' => Product::whereColumn('quantidade_stock', '<=', 'stock_minimo')->count(),
                'totalValue' => Product::sum(\DB::raw('preco * quantidade_stock')),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Loja/Create', [
            'categories' => ProductCategory::where('active', true)->get(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        Product::create($request->validated());

        return redirect()->route('loja.index')
            ->with('success', 'Produto criado com sucesso!');
    }

    public function show(Product $loja): Response
    {
        return Inertia::render('Loja/Show', [
            'product' => $loja->load(['category']),
        ]);
    }

    public function edit(Product $loja): Response
    {
        return Inertia::render('Loja/Edit', [
            'product' => $loja->load(['category']),
            'categories' => ProductCategory::where('active', true)->get(),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $loja): RedirectResponse
    {
        $loja->update($request->validated());

        return redirect()->route('loja.index')
            ->with('success', 'Produto atualizado com sucesso!');
    }

    public function destroy(Product $loja): RedirectResponse
    {
        $loja->delete();

        return redirect()->route('loja.index')
            ->with('success', 'Produto eliminado com sucesso!');
    }
}
