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

class FinancialController extends Controller
{
    public function index(): Response
    {
        $now = Carbon::now();
        $currentMonth = $now->month;
        $currentYear = $now->year;

        // Get all transactions with relationships
        $transactions = Transaction::with(['user', 'category'])
            ->orderBy('date', 'desc')
            ->get();

        // Get all membership fees with relationships
        $membershipFees = MembershipFee::with(['user', 'transaction'])
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        // Get all categories
        $categories = FinancialCategory::orderBy('name')->get();

        // Get active users for generating fees
        $users = User::where('status', 'ativo')
            ->select('id', 'full_name', 'member_number')
            ->orderBy('full_name')
            ->get();

        // Calculate stats
        $receitas = Transaction::where('type', 'receita')
            ->where('status', 'paga')
            ->sum('amount');
        
        $despesas = Transaction::where('type', 'despesa')
            ->where('status', 'paga')
            ->sum('amount');
        
        $saldoAtual = $receitas - $despesas;

        $receitasMes = Transaction::where('type', 'receita')
            ->where('status', 'paga')
            ->whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->sum('amount');

        $despesasMes = Transaction::where('type', 'despesa')
            ->where('status', 'paga')
            ->whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->sum('amount');

        $mensalidadesAtrasadas = MembershipFee::where('status', 'atrasada')
            ->orWhere(function($query) use ($now) {
                $query->where('status', 'pendente')
                    ->where(function($q) use ($now) {
                        $q->where('year', '<', $now->year)
                            ->orWhere(function($q2) use ($now) {
                                $q2->where('year', '=', $now->year)
                                    ->where('month', '<', $now->month);
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

            $monthlyReceitas = Transaction::where('type', 'receita')
                ->where('status', 'paga')
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->sum('amount');

            $monthlyDespesas = Transaction::where('type', 'despesa')
                ->where('status', 'paga')
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->sum('amount');

            $monthlyData[] = [
                'mes' => $date->format('M'),
                'receitas' => (float) $monthlyReceitas,
                'despesas' => (float) $monthlyDespesas,
            ];
        }

        return Inertia::render('Financial/Index', [
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
        return Inertia::render('Financial/Create', [
            'users' => User::where('status', 'ativo')->get(),
        ]);
    }

    public function store(StoreInvoiceRequest $request): RedirectResponse
    {
        $data = $request->validated();
        
        $invoice = Invoice::create([
            'user_id' => $data['user_id'],
            'invoice_number' => $this->generateInvoiceNumber(),
            'issue_date' => $data['issue_date'],
            'due_date' => $data['due_date'],
            'payment_status' => $data['payment_status'],
            'total_amount' => $data['total_amount'],
            'notes' => $data['notes'] ?? null,
        ]);

        // Create invoice items
        if (isset($data['items'])) {
            foreach ($data['items'] as $item) {
                $invoice->items()->create($item);
            }
        }

        return redirect()->route('financial.index')
            ->with('success', 'Fatura criada com sucesso!');
    }

    public function show(Invoice $financeiro): Response
    {
        return Inertia::render('Financial/Show', [
            'invoice' => $financeiro->load(['user', 'items']),
        ]);
    }

    public function edit(Invoice $financeiro): Response
    {
        return Inertia::render('Financial/Edit', [
            'invoice' => $financeiro->load(['items']),
            'users' => User::where('status', 'ativo')->get(),
        ]);
    }

    public function update(UpdateInvoiceRequest $request, Invoice $financeiro): RedirectResponse
    {
        $data = $request->validated();
        
        $financeiro->update([
            'user_id' => $data['user_id'],
            'issue_date' => $data['issue_date'],
            'due_date' => $data['due_date'],
            'payment_status' => $data['payment_status'],
            'total_amount' => $data['total_amount'],
            'notes' => $data['notes'] ?? null,
        ]);

        // Update invoice items
        if (isset($data['items'])) {
            $financeiro->items()->delete();
            foreach ($data['items'] as $item) {
                $financeiro->items()->create($item);
            }
        }

        return redirect()->route('financial.index')
            ->with('success', 'Fatura atualizada com sucesso!');
    }

    public function destroy(Invoice $financeiro): RedirectResponse
    {
        $financeiro->delete();

        return redirect()->route('financial.index')
            ->with('success', 'Fatura eliminada com sucesso!');
    }

    private function generateInvoiceNumber(): string
    {
        $year = now()->year;
        $lastInvoice = Invoice::whereYear('issue_date', $year)
            ->orderBy('invoice_number', 'desc')
            ->first();

        if ($lastInvoice) {
            $lastNumber = (int) substr($lastInvoice->invoice_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return sprintf('FT%d/%04d', $year, $newNumber);
    }
}
