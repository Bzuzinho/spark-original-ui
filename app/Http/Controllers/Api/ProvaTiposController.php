<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProvaTipo;
use Illuminate\Http\JsonResponse;

class ProvaTiposController extends Controller
{
    public function index(): JsonResponse
    {
        $provaTipos = ProvaTipo::query()
            ->where('ativo', true)
            ->orderBy('modalidade')
            ->orderBy('distancia')
            ->orderBy('nome')
            ->get(['id', 'nome', 'distancia', 'unidade', 'modalidade', 'ativo']);

        return response()->json($provaTipos);
    }
}
