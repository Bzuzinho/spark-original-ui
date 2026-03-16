<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PerformanceController extends Controller
{
    /**
     * GET /api/desportivo/performance
     * GET /api/desportivo/performance-metrics
     *
     * Payload estável para o frontend enquanto a origem definitiva
     * das métricas científicas é consolidada.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'performance' => [],
            'scientificMetrics' => [],
        ]);
    }
}
