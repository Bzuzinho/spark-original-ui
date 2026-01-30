<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class FinanceiroController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Financeiro/Index', [
            'invoices' => Invoice::with(['user', 'items'])
                ->latest()
                ->paginate(15),
            'stats' => [
                'totalRevenue' => Invoice::where('estado_pagamento', 'pago')->sum('valor_total'),
                'pendingPayments' => Invoice::where('estado_pagamento', 'pendente')->sum('valor_total'),
                'overduePayments' => Invoice::where('estado_pagamento', 'atrasado')->sum('valor_total'),
                'monthlyRevenue' => Invoice::whereMonth('data_emissao', now()->month)
                    ->where('estado_pagamento', 'pago')
                    ->sum('valor_total'),
            ],
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
