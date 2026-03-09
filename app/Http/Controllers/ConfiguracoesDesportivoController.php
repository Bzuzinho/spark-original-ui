<?php

namespace App\Http\Controllers;

use App\Models\AbsenceReasonConfig;
use App\Models\AthleteStatusConfig;
use App\Models\InjuryReasonConfig;
use App\Models\PoolTypeConfig;
use App\Models\TrainingTypeConfig;
use App\Models\TrainingZoneConfig;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracoesDesportivoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Configuracoes/Desportivo/Index', [
            'athleteStatuses' => AthleteStatusConfig::query()->ordenado()->get(),
            'trainingTypes' => TrainingTypeConfig::query()->ordenado()->get(),
            'trainingZones' => TrainingZoneConfig::query()->ordenado()->get(),
            'absenceReasons' => AbsenceReasonConfig::query()->ordenado()->get(),
            'injuryReasons' => InjuryReasonConfig::query()->ordenado()->get(),
            'poolTypes' => PoolTypeConfig::query()->ordenado()->get(),
        ]);
    }

    public function storeAthleteStatus(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:30|unique:athlete_status_configs,codigo',
            'nome' => 'required|string|max:100',
            'nome_en' => 'nullable|string|max:100',
            'descricao' => 'nullable|string',
            'cor' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'ativo' => 'boolean',
            'ordem' => 'nullable|integer|min:0',
        ]);

        AthleteStatusConfig::create([
            'codigo' => $data['codigo'],
            'nome' => $data['nome'],
            'nome_en' => $data['nome_en'] ?? null,
            'descricao' => $data['descricao'] ?? null,
            'cor' => $data['cor'] ?? '#6B7280',
            'ativo' => $data['ativo'] ?? true,
            'ordem' => $data['ordem'] ?? 0,
        ]);

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Estado de atleta criado com sucesso!');
    }

    public function updateAthleteStatus(Request $request, AthleteStatusConfig $athleteStatus): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:30|unique:athlete_status_configs,codigo,' . $athleteStatus->id,
            'nome' => 'required|string|max:100',
            'nome_en' => 'nullable|string|max:100',
            'descricao' => 'nullable|string',
            'cor' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'ativo' => 'boolean',
            'ordem' => 'nullable|integer|min:0',
        ]);

        $athleteStatus->update([
            'codigo' => $data['codigo'],
            'nome' => $data['nome'],
            'nome_en' => $data['nome_en'] ?? null,
            'descricao' => $data['descricao'] ?? null,
            'cor' => $data['cor'] ?? '#6B7280',
            'ativo' => $data['ativo'] ?? false,
            'ordem' => $data['ordem'] ?? 0,
        ]);

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Estado de atleta atualizado com sucesso!');
    }

    public function destroyAthleteStatus(AthleteStatusConfig $athleteStatus): RedirectResponse
    {
        $athleteStatus->delete();

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Estado de atleta eliminado com sucesso!');
    }

    public function storeTrainingType(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:30|unique:training_type_configs,codigo',
            'nome' => 'required|string|max:100',
            'nome_en' => 'nullable|string|max:100',
            'descricao' => 'nullable|string',
            'cor' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'ativo' => 'boolean',
            'ordem' => 'nullable|integer|min:0',
        ]);

        TrainingTypeConfig::create([
            'codigo' => $data['codigo'],
            'nome' => $data['nome'],
            'nome_en' => $data['nome_en'] ?? null,
            'descricao' => $data['descricao'] ?? null,
            'cor' => $data['cor'] ?? '#3B82F6',
            'ativo' => $data['ativo'] ?? true,
            'ordem' => $data['ordem'] ?? 0,
        ]);

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Tipo de treino criado com sucesso!');
    }

    public function updateTrainingType(Request $request, TrainingTypeConfig $trainingType): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:30|unique:training_type_configs,codigo,' . $trainingType->id,
            'nome' => 'required|string|max:100',
            'nome_en' => 'nullable|string|max:100',
            'descricao' => 'nullable|string',
            'cor' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'ativo' => 'boolean',
            'ordem' => 'nullable|integer|min:0',
        ]);

        $trainingType->update([
            'codigo' => $data['codigo'],
            'nome' => $data['nome'],
            'nome_en' => $data['nome_en'] ?? null,
            'descricao' => $data['descricao'] ?? null,
            'cor' => $data['cor'] ?? '#3B82F6',
            'ativo' => $data['ativo'] ?? false,
            'ordem' => $data['ordem'] ?? 0,
        ]);

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Tipo de treino atualizado com sucesso!');
    }

    public function destroyTrainingType(TrainingTypeConfig $trainingType): RedirectResponse
    {
        $trainingType->delete();

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Tipo de treino eliminado com sucesso!');
    }

    public function storeTrainingZone(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:30|unique:training_zone_configs,codigo',
            'nome' => 'required|string|max:100',
            'descricao' => 'nullable|string',
            'percentagem_min' => 'nullable|integer|min:0|max:100',
            'percentagem_max' => 'nullable|integer|min:0|max:100|gte:percentagem_min',
            'cor' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'ativo' => 'boolean',
            'ordem' => 'nullable|integer|min:0',
        ]);

        TrainingZoneConfig::create([
            'codigo' => $data['codigo'],
            'nome' => $data['nome'],
            'descricao' => $data['descricao'] ?? null,
            'percentagem_min' => $data['percentagem_min'] ?? null,
            'percentagem_max' => $data['percentagem_max'] ?? null,
            'cor' => $data['cor'] ?? '#10B981',
            'ativo' => $data['ativo'] ?? true,
            'ordem' => $data['ordem'] ?? 0,
        ]);

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Zona de treino criada com sucesso!');
    }

    public function updateTrainingZone(Request $request, TrainingZoneConfig $trainingZone): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:30|unique:training_zone_configs,codigo,' . $trainingZone->id,
            'nome' => 'required|string|max:100',
            'descricao' => 'nullable|string',
            'percentagem_min' => 'nullable|integer|min:0|max:100',
            'percentagem_max' => 'nullable|integer|min:0|max:100|gte:percentagem_min',
            'cor' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'ativo' => 'boolean',
            'ordem' => 'nullable|integer|min:0',
        ]);

        $trainingZone->update([
            'codigo' => $data['codigo'],
            'nome' => $data['nome'],
            'descricao' => $data['descricao'] ?? null,
            'percentagem_min' => $data['percentagem_min'] ?? null,
            'percentagem_max' => $data['percentagem_max'] ?? null,
            'cor' => $data['cor'] ?? '#10B981',
            'ativo' => $data['ativo'] ?? false,
            'ordem' => $data['ordem'] ?? 0,
        ]);

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Zona de treino atualizada com sucesso!');
    }

    public function destroyTrainingZone(TrainingZoneConfig $trainingZone): RedirectResponse
    {
        $trainingZone->delete();

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Zona de treino eliminada com sucesso!');
    }

    public function storeAbsenceReason(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:30|unique:absence_reason_configs,codigo',
            'nome' => 'required|string|max:100',
            'nome_en' => 'nullable|string|max:100',
            'descricao' => 'nullable|string',
            'requer_justificacao' => 'boolean',
            'ativo' => 'boolean',
            'ordem' => 'nullable|integer|min:0',
        ]);

        AbsenceReasonConfig::create([
            'codigo' => $data['codigo'],
            'nome' => $data['nome'],
            'nome_en' => $data['nome_en'] ?? null,
            'descricao' => $data['descricao'] ?? null,
            'requer_justificacao' => $data['requer_justificacao'] ?? false,
            'ativo' => $data['ativo'] ?? true,
            'ordem' => $data['ordem'] ?? 0,
        ]);

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Motivo de ausência criado com sucesso!');
    }

    public function updateAbsenceReason(Request $request, AbsenceReasonConfig $absenceReason): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:30|unique:absence_reason_configs,codigo,' . $absenceReason->id,
            'nome' => 'required|string|max:100',
            'nome_en' => 'nullable|string|max:100',
            'descricao' => 'nullable|string',
            'requer_justificacao' => 'boolean',
            'ativo' => 'boolean',
            'ordem' => 'nullable|integer|min:0',
        ]);

        $absenceReason->update([
            'codigo' => $data['codigo'],
            'nome' => $data['nome'],
            'nome_en' => $data['nome_en'] ?? null,
            'descricao' => $data['descricao'] ?? null,
            'requer_justificacao' => $data['requer_justificacao'] ?? false,
            'ativo' => $data['ativo'] ?? false,
            'ordem' => $data['ordem'] ?? 0,
        ]);

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Motivo de ausência atualizado com sucesso!');
    }

    public function destroyAbsenceReason(AbsenceReasonConfig $absenceReason): RedirectResponse
    {
        $absenceReason->delete();

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Motivo de ausência eliminado com sucesso!');
    }

    public function storeInjuryReason(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:30|unique:injury_reason_configs,codigo',
            'nome' => 'required|string|max:100',
            'nome_en' => 'nullable|string|max:100',
            'descricao' => 'nullable|string',
            'gravidade' => 'required|string|in:leve,media,grave',
            'ativo' => 'boolean',
            'ordem' => 'nullable|integer|min:0',
        ]);

        InjuryReasonConfig::create([
            'codigo' => $data['codigo'],
            'nome' => $data['nome'],
            'nome_en' => $data['nome_en'] ?? null,
            'descricao' => $data['descricao'] ?? null,
            'gravidade' => $data['gravidade'],
            'ativo' => $data['ativo'] ?? true,
            'ordem' => $data['ordem'] ?? 0,
        ]);

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Motivo de lesão criado com sucesso!');
    }

    public function updateInjuryReason(Request $request, InjuryReasonConfig $injuryReason): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:30|unique:injury_reason_configs,codigo,' . $injuryReason->id,
            'nome' => 'required|string|max:100',
            'nome_en' => 'nullable|string|max:100',
            'descricao' => 'nullable|string',
            'gravidade' => 'required|string|in:leve,media,grave',
            'ativo' => 'boolean',
            'ordem' => 'nullable|integer|min:0',
        ]);

        $injuryReason->update([
            'codigo' => $data['codigo'],
            'nome' => $data['nome'],
            'nome_en' => $data['nome_en'] ?? null,
            'descricao' => $data['descricao'] ?? null,
            'gravidade' => $data['gravidade'],
            'ativo' => $data['ativo'] ?? false,
            'ordem' => $data['ordem'] ?? 0,
        ]);

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Motivo de lesão atualizado com sucesso!');
    }

    public function destroyInjuryReason(InjuryReasonConfig $injuryReason): RedirectResponse
    {
        $injuryReason->delete();

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Motivo de lesão eliminado com sucesso!');
    }

    public function storePoolType(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:30|unique:pool_type_configs,codigo',
            'nome' => 'required|string|max:100',
            'comprimento_m' => 'nullable|integer|min:1|max:500',
            'ativo' => 'boolean',
            'ordem' => 'nullable|integer|min:0',
        ]);

        PoolTypeConfig::create([
            'codigo' => $data['codigo'],
            'nome' => $data['nome'],
            'comprimento_m' => $data['comprimento_m'] ?? null,
            'ativo' => $data['ativo'] ?? true,
            'ordem' => $data['ordem'] ?? 0,
        ]);

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Tipo de piscina criado com sucesso!');
    }

    public function updatePoolType(Request $request, PoolTypeConfig $poolType): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:30|unique:pool_type_configs,codigo,' . $poolType->id,
            'nome' => 'required|string|max:100',
            'comprimento_m' => 'nullable|integer|min:1|max:500',
            'ativo' => 'boolean',
            'ordem' => 'nullable|integer|min:0',
        ]);

        $poolType->update([
            'codigo' => $data['codigo'],
            'nome' => $data['nome'],
            'comprimento_m' => $data['comprimento_m'] ?? null,
            'ativo' => $data['ativo'] ?? false,
            'ordem' => $data['ordem'] ?? 0,
        ]);

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Tipo de piscina atualizado com sucesso!');
    }

    public function destroyPoolType(PoolTypeConfig $poolType): RedirectResponse
    {
        $poolType->delete();

        return redirect()->route('configuracoes.desportivo.index')
            ->with('success', 'Tipo de piscina eliminado com sucesso!');
    }
}
