<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EventsController extends Controller
{
    /**
     * GET /api/events
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::with(['tipoConfig', 'costCenter', 'creator']);

        // Filter by type if provided
        if ($request->has('tipo')) {
            $query->where('tipo', $request->get('tipo'));
        }

        // Filter by status if provided
        if ($request->has('estado')) {
            $query->where('estado', $request->get('estado'));
        }

        // Filter by date range
        if ($request->has('data_inicio')) {
            $query->where('data_inicio', '>=', $request->get('data_inicio'));
        }
        if ($request->has('data_fim')) {
            $query->where('data_inicio', '<=', $request->get('data_fim'));
        }

        $events = $query->orderBy('data_inicio', 'desc')->get();
        
        return response()->json($events);
    }

    /**
     * POST /api/events
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'data_inicio' => 'required|date',
            'hora_inicio' => 'nullable|date_format:H:i',
            'data_fim' => 'nullable|date',
            'hora_fim' => 'nullable|date_format:H:i',
            'local' => 'nullable|string',
            'local_detalhes' => 'nullable|string',
            'tipo' => 'required|string',
            'tipo_config_id' => 'nullable|uuid',
            'tipo_piscina' => 'nullable|in:piscina_25m,piscina_50m,aguas_abertas',
            'visibilidade' => 'nullable|in:publico,privado,restrito',
            'escaloes_elegiveis' => 'nullable|array',
            'transporte_necessario' => 'nullable|boolean',
            'transporte_detalhes' => 'nullable|string',
            'hora_partida' => 'nullable|date_format:H:i',
            'local_partida' => 'nullable|string',
            'taxa_inscricao' => 'nullable|numeric|min:0',
            'custo_inscricao_por_prova' => 'nullable|numeric|min:0',
            'custo_inscricao_por_salto' => 'nullable|numeric|min:0',
            'custo_inscricao_estafeta' => 'nullable|numeric|min:0',
            'centro_custo_id' => 'nullable|uuid',
            'observacoes' => 'nullable|string',
            'estado' => 'nullable|in:rascunho,agendado,em_curso,concluido,cancelado',
            'criado_por' => 'nullable|uuid',
            'recorrente' => 'nullable|boolean',
            'recorrencia_data_inicio' => 'nullable|date',
            'recorrencia_data_fim' => 'nullable|date',
            'recorrencia_dias_semana' => 'nullable|array',
            'evento_pai_id' => 'nullable|uuid',
        ]);

        $validated['descricao'] = $validated['descricao'] ?? '';
        $validated['criado_por'] = $validated['criado_por'] ?? auth()->id();
        $validated['estado'] = $validated['estado'] ?? 'rascunho';

        $event = Event::create($validated);
        
        return response()->json($event, 201);
    }

    /**
     * GET /api/events/{id}
     */
    public function show(string $id): JsonResponse
    {
        $event = Event::with(['tipoConfig', 'costCenter', 'creator', 'participants'])->findOrFail($id);
        return response()->json($event);
    }

    /**
     * PUT /api/events/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        
        $validated = $request->validate([
            'titulo' => 'sometimes|string|max:255',
            'descricao' => 'sometimes|string',
            'data_inicio' => 'sometimes|date',
            'hora_inicio' => 'sometimes|date_format:H:i',
            'data_fim' => 'sometimes|date',
            'hora_fim' => 'sometimes|date_format:H:i',
            'local' => 'sometimes|string',
            'local_detalhes' => 'sometimes|string',
            'tipo' => 'sometimes|string',
            'tipo_config_id' => 'sometimes|uuid',
            'tipo_piscina' => 'sometimes|in:piscina_25m,piscina_50m,aguas_abertas',
            'visibilidade' => 'sometimes|in:publico,privado,restrito',
            'escaloes_elegiveis' => 'sometimes|array',
            'transporte_necessario' => 'sometimes|boolean',
            'transporte_detalhes' => 'sometimes|string',
            'hora_partida' => 'sometimes|date_format:H:i',
            'local_partida' => 'sometimes|string',
            'taxa_inscricao' => 'sometimes|numeric|min:0',
            'custo_inscricao_por_prova' => 'sometimes|numeric|min:0',
            'custo_inscricao_por_salto' => 'sometimes|numeric|min:0',
            'custo_inscricao_estafeta' => 'sometimes|numeric|min:0',
            'centro_custo_id' => 'sometimes|uuid',
            'observacoes' => 'sometimes|string',
            'estado' => 'sometimes|in:rascunho,agendado,em_curso,concluido,cancelado',
            'recorrente' => 'sometimes|boolean',
            'recorrencia_data_inicio' => 'sometimes|date',
            'recorrencia_data_fim' => 'sometimes|date',
            'recorrencia_dias_semana' => 'sometimes|array',
            'evento_pai_id' => 'sometimes|uuid',
        ]);

        $event->update($validated);
        
        return response()->json($event);
    }

    /**
     * DELETE /api/events/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $event->delete();
        
        return response()->json(['message' => 'Event deleted successfully']);
    }
}
