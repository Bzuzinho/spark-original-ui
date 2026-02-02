<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\MembershipFee;
use Carbon\Carbon;

class FinancialReportController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $currentMonth = $now->month;
        $currentYear = $now->year;

        // Saldo atual
        $receitas = Transaction::where('type', 'receita')
            ->where('status', 'paga')
            ->sum('amount');
        
        $despesas = Transaction::where('type', 'despesa')
            ->where('status', 'paga')
            ->sum('amount');
        
        $saldoAtual = $receitas - $despesas;

        // Receitas do mês
        $receitasMes = Transaction::where('type', 'receita')
            ->where('status', 'paga')
            ->whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->sum('amount');

        // Despesas do mês
        $despesasMes = Transaction::where('type', 'despesa')
            ->where('status', 'paga')
            ->whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->sum('amount');

        // Mensalidades atrasadas
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

        // Evolução mensal (últimos 6 meses)
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

        return response()->json([
            'saldoAtual' => (float) $saldoAtual,
            'receitasMes' => (float) $receitasMes,
            'despesasMes' => (float) $despesasMes,
            'mensalidadesAtrasadas' => $mensalidadesAtrasadas,
            'monthlyData' => $monthlyData,
            'totalReceitas' => (float) $receitas,
            'totalDespesas' => (float) $despesas,
        ]);
    }
}
