<?php

namespace App\Http\Controllers;

use App\Models\ItemCategory;
use App\Models\LojaProduto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminLojaProdutoController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $query = LojaProduto::query()->with(['categoria:id,nome', 'variantes'])->ordered();

        if ($request->filled('categoria_id')) {
            $query->where('categoria_id', $request->string('categoria_id')->value());
        }

        if ($request->filled('ativo')) {
            $query->where('ativo', $request->boolean('ativo'));
        }

        if ($request->boolean('stock_baixo')) {
            $query->whereColumn('stock_atual', '<=', 'stock_minimo');
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('nome', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('descricao', 'like', "%{$search}%");
            });
        }

        $products = $query->get()->map(fn (LojaProduto $produto) => $this->serializeProduct($produto))->values()->all();

        if ($request->is('api/*')) {
            return response()->json($products);
        }

        return Inertia::render('Admin/Store/AdminProductList', [
            'products' => $products,
            'categories' => $this->categoriesPayload(),
            'filters' => $request->only(['search', 'categoria_id', 'ativo', 'stock_baixo']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Store/AdminProductForm', [
            'product' => null,
            'categories' => $this->categoriesPayload(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePayload($request);
        $validated['slug'] = $this->resolveSlug($validated['slug'] ?? null, $validated['nome']);

        $product = LojaProduto::create($validated);
        $this->syncVariants($product, $request->input('variantes', []));

        return response()->json($this->serializeProduct($product->fresh(['categoria', 'variantes'])), 201);
    }

    public function show(Request $request, LojaProduto $produto): JsonResponse
    {
        return response()->json($this->serializeProduct($produto->load(['categoria', 'variantes'])));
    }

    public function edit(LojaProduto $produto): Response
    {
        return Inertia::render('Admin/Store/AdminProductForm', [
            'product' => $this->serializeProduct($produto->load(['categoria', 'variantes'])),
            'categories' => $this->categoriesPayload(),
        ]);
    }

    public function update(Request $request, LojaProduto $produto): JsonResponse
    {
        $validated = $this->validatePayload($request, $produto);
        $validated['slug'] = $this->resolveSlug($validated['slug'] ?? $produto->slug, $validated['nome']);

        $produto->update($validated);
        $this->syncVariants($produto, $request->input('variantes', []));

        return response()->json($this->serializeProduct($produto->fresh(['categoria', 'variantes'])));
    }

    public function destroy(LojaProduto $produto): JsonResponse
    {
        $produto->delete();

        return response()->json(['message' => 'Produto removido com sucesso.']);
    }

    private function validatePayload(Request $request, ?LojaProduto $produto = null): array
    {
        return $request->validate([
            'categoria_id' => ['nullable', 'uuid', 'exists:item_categories,id'],
            'codigo' => ['nullable', 'string', 'max:100', Rule::unique('loja_produtos', 'codigo')->ignore($produto?->id)],
            'nome' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('loja_produtos', 'slug')->ignore($produto?->id)],
            'descricao' => ['nullable', 'string'],
            'preco' => ['required', 'numeric', 'min:0'],
            'imagem_principal_path' => ['nullable', 'string', 'max:255'],
            'ativo' => ['required', 'boolean'],
            'destaque' => ['required', 'boolean'],
            'gere_stock' => ['required', 'boolean'],
            'stock_atual' => ['required', 'integer', 'min:0'],
            'stock_minimo' => ['nullable', 'integer', 'min:0'],
            'ordem' => ['nullable', 'integer'],
        ]);
    }

    private function syncVariants(LojaProduto $produto, array $variantes): void
    {
        $existingIds = collect($variantes)->pluck('id')->filter()->all();
        $produto->variantes()->whereNotIn('id', $existingIds)->delete();

        foreach ($variantes as $variant) {
            $payload = validator($variant, [
                'id' => ['nullable', 'uuid'],
                'nome' => ['nullable', 'string', 'max:255'],
                'tamanho' => ['nullable', 'string', 'max:80'],
                'cor' => ['nullable', 'string', 'max:80'],
                'sku' => ['nullable', 'string', 'max:120'],
                'preco_extra' => ['nullable', 'numeric', 'min:0'],
                'stock_atual' => ['nullable', 'integer', 'min:0'],
                'ativo' => ['required', 'boolean'],
            ])->validate();

            $produto->variantes()->updateOrCreate(
                ['id' => $payload['id'] ?? null],
                [
                    'nome' => $payload['nome'] ?? null,
                    'tamanho' => $payload['tamanho'] ?? null,
                    'cor' => $payload['cor'] ?? null,
                    'sku' => $payload['sku'] ?? null,
                    'preco_extra' => $payload['preco_extra'] ?? 0,
                    'stock_atual' => $payload['stock_atual'] ?? 0,
                    'ativo' => $payload['ativo'],
                ]
            );
        }
    }

    private function categoriesPayload(): array
    {
        return ItemCategory::query()
            ->active()
            ->forContext('loja')
            ->orderBy('nome')
            ->get(['id', 'codigo', 'nome', 'contexto'])
            ->toArray();
    }

    private function resolveSlug(?string $slug, string $name): string
    {
        return Str::slug($slug ?: $name);
    }

    private function serializeProduct(LojaProduto $produto): array
    {
        return [
            'id' => $produto->id,
            'categoria_id' => $produto->categoria_id,
            'codigo' => $produto->codigo,
            'nome' => $produto->nome,
            'slug' => $produto->slug,
            'descricao' => $produto->descricao,
            'preco' => (float) $produto->preco,
            'imagem_principal_path' => $produto->imagem_principal_path,
            'ativo' => (bool) $produto->ativo,
            'destaque' => (bool) $produto->destaque,
            'gere_stock' => (bool) $produto->gere_stock,
            'stock_atual' => (int) $produto->stock_atual,
            'stock_minimo' => $produto->stock_minimo,
            'ordem' => $produto->ordem,
            'categoria' => $produto->categoria ? [
                'id' => $produto->categoria->id,
                'nome' => $produto->categoria->nome,
            ] : null,
            'variantes' => $produto->variantes->map(fn ($variante) => [
                'id' => $variante->id,
                'nome' => $variante->nome,
                'tamanho' => $variante->tamanho,
                'cor' => $variante->cor,
                'sku' => $variante->sku,
                'preco_extra' => (float) $variante->preco_extra,
                'stock_atual' => (int) $variante->stock_atual,
                'ativo' => (bool) $variante->ativo,
            ])->values(),
        ];
    }
}