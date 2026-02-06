<?php

namespace App\Http\Controllers;

use App\Models\UserType;
use App\Models\AgeGroup;
use App\Models\EventType;
use App\Models\ClubSetting;
use App\Models\CostCenter;
use App\Models\MonthlyFee;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\UserTypePermission;
use App\Models\NotificationPreference;
use App\Models\ProvaTipo;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ConfiguracoesController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Configuracoes/Index', [
            'userTypes' => UserType::all(),
            'ageGroups' => AgeGroup::all(),
            'eventTypes' => EventType::all(),
            'clubSettings' => ClubSetting::first(),
            'permissions' => UserTypePermission::all(),
            'costCenters' => CostCenter::all(),
            'monthlyFees' => MonthlyFee::all(),
            'products' => Product::all(),
            'suppliers' => Supplier::all(),
            'provaTipos' => ProvaTipo::all(),
            'notificationPrefs' => NotificationPreference::first(),
            'users' => User::select('id', 'numero_socio', 'nome_completo', 'email_utilizador', 'perfil', 'estado')->get(),
        ]);
    }

    public function storeUserType(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        UserType::create($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Tipo de utilizador criado com sucesso!');
    }

    public function updateUserType(Request $request, UserType $userType): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        $userType->update($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Tipo de utilizador atualizado com sucesso!');
    }

    public function destroyUserType(UserType $userType): RedirectResponse
    {
        $userType->delete();

        return redirect()->route('configuracoes')
            ->with('success', 'Tipo de utilizador eliminado com sucesso!');
    }

    public function storeAgeGroup(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'idade_minima' => 'required|integer|min:0',
            'idade_maxima' => 'required|integer|min:0',
            'descricao' => 'nullable|string',
        ]);

        AgeGroup::create($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Escalão etário criado com sucesso!');
    }

    public function updateAgeGroup(Request $request, AgeGroup $ageGroup): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'idade_minima' => 'required|integer|min:0',
            'idade_maxima' => 'required|integer|min:0',
            'descricao' => 'nullable|string',
        ]);

        $ageGroup->update($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Escalão etário atualizado com sucesso!');
    }

    public function destroyAgeGroup(AgeGroup $ageGroup): RedirectResponse
    {
        $ageGroup->delete();

        return redirect()->route('configuracoes')
            ->with('success', 'Escalão etário eliminado com sucesso!');
    }

    public function storeEventType(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'categoria' => 'nullable|string',
            'cor' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        EventType::create($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Tipo de evento criado com sucesso!');
    }

    public function updateEventType(Request $request, EventType $eventType): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'categoria' => 'nullable|string',
            'cor' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        $eventType->update($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Tipo de evento atualizado com sucesso!');
    }

    public function destroyEventType(EventType $eventType): RedirectResponse
    {
        $eventType->delete();

        return redirect()->route('configuracoes')
            ->with('success', 'Tipo de evento eliminado com sucesso!');
    }

    public function updateClubSettings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nome_clube' => 'required|string|max:255',
            'sigla' => 'nullable|string|max:10',
            'morada' => 'nullable|string',
            'codigo_postal' => 'nullable|string|max:20',
            'localidade' => 'nullable|string|max:100',
            'telefone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'nif' => 'nullable|string|max:20',
            'iban' => 'nullable|string|max:34',
            'logo_url' => 'nullable|string',
            'logo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('club-logos', 'public');
            $data['logo_url'] = Storage::url($path);
        }

        unset($data['logo']);

        $clubSettings = ClubSetting::first();
        
        if ($clubSettings) {
            $clubSettings->update($data);
        } else {
            ClubSetting::create($data);
        }

        return redirect()->route('configuracoes')
            ->with('success', 'Configurações do clube atualizadas com sucesso!');
    }

    public function storePermission(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'user_type_id' => 'required|exists:user_types,id',
            'modulo' => 'required|string|max:100',
            'submodulo' => 'nullable|string|max:100',
            'separador' => 'nullable|string|max:100',
            'campo' => 'nullable|string|max:100',
            'pode_ver' => 'boolean',
            'pode_criar' => 'boolean',
            'pode_editar' => 'boolean',
            'pode_eliminar' => 'boolean',
        ]);

        UserTypePermission::create($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Permissão criada com sucesso!');
    }

    public function updatePermission(Request $request, UserTypePermission $permission): RedirectResponse
    {
        $data = $request->validate([
            'user_type_id' => 'required|exists:user_types,id',
            'modulo' => 'required|string|max:100',
            'submodulo' => 'nullable|string|max:100',
            'separador' => 'nullable|string|max:100',
            'campo' => 'nullable|string|max:100',
            'pode_ver' => 'boolean',
            'pode_criar' => 'boolean',
            'pode_editar' => 'boolean',
            'pode_eliminar' => 'boolean',
        ]);

        $permission->update($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Permissão atualizada com sucesso!');
    }

    public function destroyPermission(UserTypePermission $permission): RedirectResponse
    {
        $permission->delete();

        return redirect()->route('configuracoes')
            ->with('success', 'Permissão eliminada com sucesso!');
    }

    public function storeCostCenter(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'nullable|string|max:50|unique:cost_centers,codigo',
            'nome' => 'required|string|max:255',
            'tipo' => 'nullable|string|max:100',
            'descricao' => 'nullable|string',
            'orcamento' => 'nullable|numeric|min:0',
            'ativo' => 'boolean',
        ]);

        if (empty($data['codigo'])) {
            $data['codigo'] = 'CC-' . strtoupper(Str::random(6));
        }

        CostCenter::create($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Centro de custos criado com sucesso!');
    }

    public function updateCostCenter(Request $request, CostCenter $costCenter): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:50|unique:cost_centers,codigo,' . $costCenter->id,
            'nome' => 'required|string|max:255',
            'tipo' => 'nullable|string|max:100',
            'descricao' => 'nullable|string',
            'orcamento' => 'nullable|numeric|min:0',
            'ativo' => 'boolean',
        ]);

        $costCenter->update($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Centro de custos atualizado com sucesso!');
    }

    public function destroyCostCenter(CostCenter $costCenter): RedirectResponse
    {
        $costCenter->delete();

        return redirect()->route('configuracoes')
            ->with('success', 'Centro de custos eliminado com sucesso!');
    }

    public function storeMonthlyFee(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'designacao' => 'required|string|max:255',
            'valor' => 'required|numeric|min:0',
            'age_group_id' => 'nullable|exists:age_groups,id',
            'ativo' => 'boolean',
        ]);

        MonthlyFee::create($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Mensalidade criada com sucesso!');
    }

    public function updateMonthlyFee(Request $request, MonthlyFee $monthlyFee): RedirectResponse
    {
        $data = $request->validate([
            'designacao' => 'required|string|max:255',
            'valor' => 'required|numeric|min:0',
            'age_group_id' => 'nullable|exists:age_groups,id',
            'ativo' => 'boolean',
        ]);

        $monthlyFee->update($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Mensalidade atualizada com sucesso!');
    }

    public function destroyMonthlyFee(MonthlyFee $monthlyFee): RedirectResponse
    {
        $monthlyFee->delete();

        return redirect()->route('configuracoes')
            ->with('success', 'Mensalidade eliminada com sucesso!');
    }

    public function storeProduct(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:50|unique:products,codigo',
            'nome' => 'required|string|max:255',
            'categoria' => 'nullable|string|max:100',
            'preco' => 'required|numeric|min:0',
            'descricao' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        $data['stock'] = $data['stock'] ?? 0;
        $data['stock_minimo'] = $data['stock_minimo'] ?? 0;

        Product::create($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Artigo criado com sucesso!');
    }

    public function updateProduct(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:50|unique:products,codigo,' . $product->id,
            'nome' => 'required|string|max:255',
            'categoria' => 'nullable|string|max:100',
            'preco' => 'required|numeric|min:0',
            'descricao' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        $product->update($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Artigo atualizado com sucesso!');
    }

    public function destroyProduct(Product $product): RedirectResponse
    {
        $product->delete();

        return redirect()->route('configuracoes')
            ->with('success', 'Artigo eliminado com sucesso!');
    }

    public function storeSupplier(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'nif' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'telefone' => 'nullable|string|max:30',
            'morada' => 'nullable|string',
            'categoria' => 'nullable|string|max:100',
            'ativo' => 'boolean',
        ]);

        Supplier::create($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Fornecedor criado com sucesso!');
    }

    public function updateSupplier(Request $request, Supplier $supplier): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'nif' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'telefone' => 'nullable|string|max:30',
            'morada' => 'nullable|string',
            'categoria' => 'nullable|string|max:100',
            'ativo' => 'boolean',
        ]);

        $supplier->update($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Fornecedor atualizado com sucesso!');
    }

    public function destroySupplier(Supplier $supplier): RedirectResponse
    {
        $supplier->delete();

        return redirect()->route('configuracoes')
            ->with('success', 'Fornecedor eliminado com sucesso!');
    }

    public function storeProvaTipo(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'distancia' => 'required|integer|min:0',
            'unidade' => 'required|string|max:20',
            'modalidade' => 'required|string|max:100',
            'ativo' => 'boolean',
        ]);

        ProvaTipo::create($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Prova criada com sucesso!');
    }

    public function updateProvaTipo(Request $request, ProvaTipo $provaTipo): RedirectResponse
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'distancia' => 'required|integer|min:0',
            'unidade' => 'required|string|max:20',
            'modalidade' => 'required|string|max:100',
            'ativo' => 'boolean',
        ]);

        $provaTipo->update($data);

        return redirect()->route('configuracoes')
            ->with('success', 'Prova atualizada com sucesso!');
    }

    public function destroyProvaTipo(ProvaTipo $provaTipo): RedirectResponse
    {
        $provaTipo->delete();

        return redirect()->route('configuracoes')
            ->with('success', 'Prova eliminada com sucesso!');
    }

    public function updateNotificationPreferences(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email_notificacoes' => 'boolean',
            'alertas_pagamento' => 'boolean',
            'alertas_atividade' => 'boolean',
        ]);

        $prefs = NotificationPreference::first();

        if ($prefs) {
            $prefs->update($data);
        } else {
            NotificationPreference::create($data);
        }

        return redirect()->route('configuracoes')
            ->with('success', 'Preferências atualizadas com sucesso!');
    }
}
