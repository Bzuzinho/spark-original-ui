<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Transaction;
use App\Models\FinancialCategory;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with(['user', 'category'])
            ->orderBy('data', 'desc')
            ->paginate(15);

        return response()->json($transactions);
    }

    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Handle file upload
        if ($request->hasFile('comprovativo')) {
            $data['comprovativo'] = $request->file('comprovativo')->store('comprovanvos', 'public');
        }

        Transaction::create($data);

        return redirect()->back()->with('success', 'Transação criada com sucesso!');
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): RedirectResponse
    {
        $data = $request->validated();

        // Handle file upload
        if ($request->hasFile('comprovativo')) {
            // Delete old file if exists
            if ($transaction->comprovativo) {
                Storage::disk('public')->delete($transaction->comprovativo);
            }
            $data['comprovativo'] = $request->file('comprovativo')->store('comprovatives', 'public');
        }

        $transaction->update($data);

        return redirect()->back()->with('success', 'Transação atualizada com sucesso!');
    }

    public function destroy(Transaction $transaction): RedirectResponse
    {
        // Delete file if exists
        if ($transaction->comprovativo) {
            Storage::disk('public')->delete($transaction->comprovativo);
        }

        $transaction->delete();

        return redirect()->back()->with('success', 'Transação eliminada com sucesso!');
    }
}
