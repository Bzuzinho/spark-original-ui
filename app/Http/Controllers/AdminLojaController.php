<?php

namespace App\Http\Controllers;

use App\Services\Loja\LojaEncomendaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminLojaController extends Controller
{
    public function __construct(
        private readonly LojaEncomendaService $encomendaService,
    ) {
    }

    public function index(Request $request): Response|JsonResponse
    {
        $metrics = $this->encomendaService->dashboardMetrics();
        $payload = [
            'total_produtos_ativos' => $metrics['total_produtos_ativos'],
            'produtos_sem_stock' => $metrics['produtos_sem_stock'],
            'encomendas_pendentes' => $metrics['encomendas_pendentes'],
            'encomendas_preparadas' => $metrics['encomendas_preparadas'],
            'ultimos_pedidos' => $metrics['ultimos_pedidos']->map(fn ($pedido) => [
                'id' => $pedido->id,
                'numero' => $pedido->numero,
                'estado' => $pedido->estado,
                'total' => (float) $pedido->total,
                'created_at' => $pedido->created_at?->toDateTimeString(),
                'user' => $pedido->user?->nome_completo,
                'target_user' => $pedido->targetUser?->nome_completo,
            ])->values(),
        ];

        if ($request->is('api/*')) {
            return response()->json($payload);
        }

        return Inertia::render('Admin/Store/AdminStoreDashboard', [
            'dashboard' => $payload,
        ]);
    }
}