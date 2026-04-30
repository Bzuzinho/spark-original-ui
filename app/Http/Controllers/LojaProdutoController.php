<?php

namespace App\Http\Controllers;

use App\Services\Loja\StorefrontCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LojaProdutoController extends Controller
{
    public function __construct(
        private readonly StorefrontCatalogService $catalogService,
    ) {
    }

    public function show(Request $request, string $produto): Response|JsonResponse
    {
        $payload = $this->catalogService->productDetailPayload($produto);

        if ($request->is('api/*')) {
            return response()->json($payload);
        }

        return Inertia::render('Store/ProductDetailPage', [
            'product' => $payload,
        ]);
    }
}