<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\User;
use App\Models\Transaction;
use App\Models\MembershipFee;
use App\Models\FinancialCategory;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon;

class FinanceiroController extends Controller
{
    public function index(): Response
    {
        $now = Carbon::now();
        $currentMonth = $now->month;
        $currentYear = $now->year;

        // Get all transactions with relationships
        $transactions = Transaction::with(['user', 'category'])
            ->orderBy('data', 'desc')
            ->get();

        // Get all membership fees with relationships
        $membershipFees = MembershipFee::with(['user', 'transaction'])
            ->orderBy('ano', 'desc')
            ->orderBy('mes', 'desc')
            ->get();

        // Get all categories
        $categories = FinancialCategory::orderBy('nome')->get();

        // Get active users for generating fees
        $users = User::where('estado', 'ativo')
            ->select('id', 'nome_completo', 'numero_socio')
            ->orderBy('nome_completo')
            ->get();

        // Calculate stats
        $receitas = Transaction::where('tipo', 'receita')
            ->where('estado', 'paga')
            ->sum('valor');
        
        $despesas = Transaction::where('tipo', 'despesa')
            ->where('estado', 'paga')
            ->sum('valor');
        
        $saldoAtual = $receitas - $despesas;

        $receitasMes = Transaction::where('tipo', 'receita')
            ->where('estado', 'paga')
            ->whereMonth('data', $currentMonth)
            ->whereYear('data', $currentYear)
            ->sum('valor');

        $despesasMes = Transaction::where('tipo', 'despesa')
            ->where('estado', 'paga')
            ->whereMonth('data', $currentMonth)
            ->whereYear('data', $currentYear)
            ->sum('valor');

        $mensalidadesAtrasadas = MembershipFee::where('estado', 'atrasada')
            ->orWhere(function($query) use ($now) {
                $query->where('estado', 'pendente')
                    ->where(function($q) use ($now) {
                        $q->where('ano', '<', $now->year)
                            ->orWhere(function($q2) use ($now) {
                                $q2->where('ano', '=', $now->year)
                                    ->where('mes', '<', $now->month);
                            });
                    });
            })
            ->count();

        // Get monthly evolution data (last 6 months)
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $month = $date->month;
            $year = $date->year;

            $monthlyReceitas = Transaction::where('tipo', 'receita')
                ->where('estado', 'paga')
                ->whereMonth('data', $month)
                ->whereYear('data', $year)
                ->sum('valor');

            $monthlyDespesas = Transaction::where('tipo', 'despesa')
                ->where('estado', 'paga')
                ->whereMonth('data', $month)
                ->whereYear('data', $year)
                ->sum('valor');

            $monthlyData[] = [
                'mes' => $date->format('M'),
                'receitas' => (float) $monthlyReceitas,
                'despesas' => (float) $monthlyDespesas,
            ];
        }

        return Inertia::render('Financeiro/Index', [
            'transactions' => $transactions,
            'membershipFees' => $membershipFees,
            'categories' => $categories,
            'users' => $users,
            'stats' => [
                'saldoAtual' => (float) $saldoAtual,
                'receitasMes' => (float) $receitasMes,
                'despesasMes' => (float) $despesasMes,
                'mensalidadesAtrasadas' => $mensalidadesAtrasadas,
                'totalReceitas' => (float) $receitas,
                'totalDespesas' => (float) $despesas,
            ],
            'monthlyData' => $monthlyData,
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
            'numero_fatura' => $this->generateInvoiceNumber(),
            'data_emissao' => $data['data_emissao'],
            'data_vencimento' => $data['data_vencimento'],
            'estado_pagamento' => $data['estado_pagamento'],
            'valor_total' => $data['valor_total'],
            'observacoes' => $data['observacoes'] ?? null,
        ]);

        // Create invoice items
        if (isset($data['items'])) {
            foreach ($data['items'] as $item) {
                $invoice->items()->create($item);
            }
        }

        return redirect()->route('financeiro.index')
            ->with('success', 'Fatura criada com sucesso!');
    }

    public function show(Invoice $financeiro): Response
    {
        return Inertia::render('Financeiro/Show', [
            'invoice' => $financeiro->load(['user', 'items']),
        ]);
    }

    public function edit(Invoice $financeiro): Response
    {
        return Inertia::render('Financeiro/Edit', [
            'invoice' => $financeiro->load(['items']),
            'users' => User::where('estado', 'ativo')->get(),
        ]);
    }

    public function update(UpdateInvoiceRequest $request, Invoice $financeiro): RedirectResponse
    {
        $data = $request->validated();
        
        $financeiro->update([
            'user_id' => $data['user_id'],
            'data_emissao' => $data['data_emissao'],
            'data_vencimento' => $data['data_vencimento'],
            'estado_pagamento' => $data['estado_pagamento'],
            'valor_total' => $data['valor_total'],
            'observacoes' => $data['observacoes'] ?? null,
        ]);

        // Update invoice items
        if (isset($data['items'])) {
            $financeiro->items()->delete();
            foreach ($data['items'] as $item) {
                $financeiro->items()->create($item);
            }
        }

        return redirect()->route('financeiro.index')
            ->with('success', 'Fatura atualizada com sucesso!');
    }

    public function destroy(Invoice $financeiro): RedirectResponse
    {
        $financeiro->delete();

        return redirect()->route('financeiro.index')
            ->with('success', 'Fatura eliminada com sucesso!');
    }

    private function generateInvoiceNumber(): string
    {
        $year = now()->year;
        $lastInvoice = Invoice::whereYear('data_emissao', $year)
            ->orderBy('numero_fatura', 'desc')
            ->first();

        if ($lastInvoice) {
            $lastNumber = (int) substr($lastInvoice->numero_fatura, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return sprintf('FT%d/%04d', $year, $newNumber);
    }
}
