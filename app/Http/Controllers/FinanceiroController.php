<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Models\AgeGroup;
use App\Models\BankStatement;
use App\Models\CostCenter;
use App\Models\FinancialEntry;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoiceType;
use App\Models\MonthlyFee;
use App\Models\Movement;
use App\Models\MovementItem;
use App\Models\Product;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class FinanceiroController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Financeiro/Index', [
            'faturas' => Invoice::orderBy('data_emissao', 'desc')->get()->map(function ($fatura) {
                $fatura->valor_total = (float) $fatura->valor_total;
                return $fatura;
            }),
            'faturaItens' => InvoiceItem::orderBy('created_at', 'desc')->get(),
            'movimentos' => Movement::orderBy('data_emissao', 'desc')->get()->map(function ($movimento) {
                $movimento->valor_total = (float) $movimento->valor_total;
                return $movimento;
            }),
            'movimentoItens' => MovementItem::orderBy('created_at', 'desc')->get(),
            'lancamentos' => FinancialEntry::orderBy('data', 'desc')->get()->map(function ($lancamento) {
                $lancamento->valor = (float) $lancamento->valor;
                return $lancamento;
            }),
            'extratos' => BankStatement::orderBy('data_movimento', 'desc')->get()->map(function ($extrato) {
                $extrato->valor = (float) $extrato->valor;
                $extrato->saldo = $extrato->saldo !== null ? (float) $extrato->saldo : null;
                return $extrato;
            }),
            'centrosCusto' => CostCenter::orderBy('nome')->get(),
            'users' => User::select(
                'id',
                'nome_completo',
                'numero_socio',
                'data_inscricao',
                'tipo_mensalidade',
                'centro_custo',
                'tipo_membro',
                'escalao',
                'nif',
                'morada'
            )->orderBy('nome_completo')->get(),
            'products' => Product::select('id', 'nome', 'preco', 'stock', 'stock_minimo', 'ativo')
                ->orderBy('nome')
                ->get()
                ->map(function ($product) {
                    $product->preco = (float) $product->preco;
                    return $product;
                }),
            'mensalidades' => MonthlyFee::select('id', 'designacao', 'valor', 'age_group_id')
                ->get()
                ->map(function ($mensalidade) {
                    $mensalidade->valor = (float) $mensalidade->valor;
                    return $mensalidade;
                }),
            'invoiceTypes' => InvoiceType::orderBy('nome')->get(),
            'ageGroups' => AgeGroup::select('id', 'nome')->orderBy('nome')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Financeiro/Create', [
            'users' => User::where('estado', 'ativo')->get(),
        ]);
    }

    public function store(StoreInvoiceRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $invoice = Invoice::create([
            'user_id' => $data['user_id'],
            'data_fatura' => $data['data_fatura'] ?? $data['data_emissao'],
            'mes' => $data['mes'] ?? null,
            'data_emissao' => $data['data_emissao'],
            'data_vencimento' => $data['data_vencimento'],
            'valor_total' => $data['valor_total'],
            'oculta' => $data['oculta'] ?? false,
            'estado_pagamento' => $data['estado_pagamento'] ?? 'pendente',
            'numero_recibo' => $data['numero_recibo'] ?? null,
            'referencia_pagamento' => $data['referencia_pagamento'] ?? null,
            'centro_custo_id' => $data['centro_custo_id'] ?? null,
            'tipo' => $data['tipo'],
            'origem_tipo' => $data['origem_tipo'] ?? null,
            'origem_id' => $data['origem_id'] ?? null,
            'observacoes' => $data['observacoes'] ?? null,
        ]);

        if (isset($data['items'])) {
            foreach ($data['items'] as $item) {
                InvoiceItem::create([
                    'fatura_id' => $invoice->id,
                    'descricao' => $item['descricao'],
                    'quantidade' => $item['quantidade'],
                    'valor_unitario' => $item['valor_unitario'],
                    'imposto_percentual' => $item['imposto_percentual'] ?? 0,
                    'total_linha' => $item['total_linha'],
                    'produto_id' => $item['produto_id'] ?? null,
                    'centro_custo_id' => $item['centro_custo_id'] ?? $data['centro_custo_id'] ?? null,
                ]);
            }
        }

        if ($request->expectsJson()) {
            return response()->json([
                'invoice' => $invoice->load('items'),
            ]);
        }

        return redirect()->route('financeiro.index')
            ->with('success', 'Fatura criada com sucesso!');
    }

    public function show(Invoice $financial): Response
    {
        return Inertia::render('Financeiro/Show', [
            'invoice' => $financial->load(['user', 'items']),
        ]);
    }

    public function edit(Invoice $financial): Response
    {
        return Inertia::render('Financeiro/Edit', [
            'invoice' => $financial->load(['items']),
            'users' => User::where('estado', 'ativo')->get(),
        ]);
    }

    public function update(UpdateInvoiceRequest $request, Invoice $financial): RedirectResponse
    {
        $data = $request->validated();

        $financial->update([
            'user_id' => $data['user_id'],
            'data_fatura' => $data['data_fatura'] ?? $data['data_emissao'],
            'mes' => $data['mes'] ?? null,
            'data_emissao' => $data['data_emissao'],
            'data_vencimento' => $data['data_vencimento'],
            'valor_total' => $data['valor_total'],
            'oculta' => $data['oculta'] ?? $financial->oculta,
            'estado_pagamento' => $data['estado_pagamento'] ?? $financial->estado_pagamento,
            'numero_recibo' => $data['numero_recibo'] ?? $financial->numero_recibo,
            'referencia_pagamento' => $data['referencia_pagamento'] ?? $financial->referencia_pagamento,
            'centro_custo_id' => $data['centro_custo_id'] ?? null,
            'tipo' => $data['tipo'],
            'origem_tipo' => $data['origem_tipo'] ?? $financial->origem_tipo,
            'origem_id' => $data['origem_id'] ?? $financial->origem_id,
            'observacoes' => $data['observacoes'] ?? null,
        ]);

        if (isset($data['items'])) {
            InvoiceItem::where('fatura_id', $financial->id)->delete();
            foreach ($data['items'] as $item) {
                InvoiceItem::create([
                    'fatura_id' => $financial->id,
                    'descricao' => $item['descricao'],
                    'quantidade' => $item['quantidade'],
                    'valor_unitario' => $item['valor_unitario'],
                    'imposto_percentual' => $item['imposto_percentual'] ?? 0,
                    'total_linha' => $item['total_linha'],
                    'produto_id' => $item['produto_id'] ?? null,
                    'centro_custo_id' => $item['centro_custo_id'] ?? $data['centro_custo_id'] ?? null,
                ]);
            }
        }

        if ($request->expectsJson()) {
            return response()->json([
                'invoice' => $financial->load('items'),
            ]);
        }

        return redirect()->route('financeiro.index')
            ->with('success', 'Fatura atualizada com sucesso!');
    }

    public function destroy(Invoice $financial): RedirectResponse
    {
        $financial->delete();

        return redirect()->route('financeiro.index')
            ->with('success', 'Fatura eliminada com sucesso!');
    }
}
