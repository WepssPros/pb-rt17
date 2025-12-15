<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\CashAccount;
use App\Models\CashTransaction;
use App\Models\ProjectTarget;
use App\Models\Purchase;
use App\Models\Sale;

class DashboardController extends Controller
{
    public function index()
    {
        $kasUtamaId = 1;

        // =========================
        // KAS SAAT INI
        // =========================
        $cashAccount = CashAccount::find($kasUtamaId);
        $currentCash = $cashAccount?->balance ?? 0;

        // =========================
        // BASE QUERY
        // =========================
        $baseTx = CashTransaction::query()
            ->where('cash_account_id', $kasUtamaId);

        // =========================
        // RULE REF (REALTIME SESUAI KODE KAMU)
        // PEMASUKAN: IUR, SELL
        // PENGELUARAN: PUR, GTG, BUY
        // + dukung format lama Sale::class / Purchase::class
        // =========================
        $incomeRef = function ($q) {
            $q->where('reference_type', Sale::class)
                ->orWhere('reference_type', 'LIKE', 'IUR%')
                ->orWhere('reference_type', 'LIKE', 'SELL%');
        };

        $expenseRef = function ($q) {
            $q->where('reference_type', Purchase::class)
                ->orWhere('reference_type', 'LIKE', 'PUR%')
                ->orWhere('reference_type', 'LIKE', 'GTG%')
                ->orWhere('reference_type', 'LIKE', 'BUY%');
        };

        // =========================
        // TOTAL PEMASUKAN & PENGELUARAN
        // =========================
        $totalSales = (clone $baseTx)
            ->where('type', 'in')
            ->where($incomeRef)
            ->sum('amount');

        $totalPurchase = (clone $baseTx)
            ->where('type', 'out')
            ->where($expenseRef)
            ->sum('amount');

        $profit = $totalSales - $totalPurchase;

        // =========================
        // TOTAL TRANSAKSI (SEMUA)
        // =========================
        $totalTransactions = (clone $baseTx)->count();

        // =========================
        // PEMASUKAN PER BULAN (CHART TAHUN INI)
        // =========================
        $year = now()->year;

        $salesPerMonth = (clone $baseTx)
            ->where('type', 'in')
            ->whereYear('created_at', $year)
            ->where($incomeRef)
            ->selectRaw('MONTH(created_at) as month, SUM(amount) as total')
            ->groupBy('month')
            ->pluck('total', 'month')
            ->toArray();

        // =========================
        // GROWTH BULAN INI VS BULAN LALU (UNTUK "LAPORAN")
        // =========================
        $startThisMonth = now()->startOfMonth();
        $endThisMonth   = now()->endOfMonth();

        $startLastMonth = now()->subMonth()->startOfMonth();
        $endLastMonth   = now()->subMonth()->endOfMonth();

        $incomeThisMonth = (clone $baseTx)
            ->where('type', 'in')
            ->whereBetween('created_at', [$startThisMonth, $endThisMonth])
            ->where($incomeRef)
            ->sum('amount');

        $incomeLastMonth = (clone $baseTx)
            ->where('type', 'in')
            ->whereBetween('created_at', [$startLastMonth, $endLastMonth])
            ->where($incomeRef)
            ->sum('amount');

        $expenseThisMonth = (clone $baseTx)
            ->where('type', 'out')
            ->whereBetween('created_at', [$startThisMonth, $endThisMonth])
            ->where($expenseRef)
            ->sum('amount');

        $expenseLastMonth = (clone $baseTx)
            ->where('type', 'out')
            ->whereBetween('created_at', [$startLastMonth, $endLastMonth])
            ->where($expenseRef)
            ->sum('amount');

        $profitThisMonth = $incomeThisMonth - $expenseThisMonth;
        $profitLastMonth = $incomeLastMonth - $expenseLastMonth;

        // persen growth
        $growthIncome  = $incomeLastMonth > 0 ? (($incomeThisMonth - $incomeLastMonth) / $incomeLastMonth) * 100 : 0;
        $growthExpense = $expenseLastMonth > 0 ? (($expenseThisMonth - $expenseLastMonth) / $expenseLastMonth) * 100 : 0;
        $growthProfit  = $profitLastMonth != 0 ? (($profitThisMonth - $profitLastMonth) / abs($profitLastMonth)) * 100 : 0;

        // =========================
        // TARGET PROYEK
        // =========================
        $projectTargets = ProjectTarget::with('cashAccount')
            ->orderBy('target_date', 'asc')
            ->get()
            ->map(function ($p) {
                $saldo = $p->cashAccount?->balance ?? 0;
                $progress = $p->achievement;
                $status = $progress >= 100 ? 'success' : ($progress >= 75 ? 'info' : ($progress >= 50 ? 'warning' : 'danger'));

                return [
                    'name' => $p->name,
                    'progress' => $progress,
                    'status' => $status,
                    'target_amount' => number_format($p->target_amount, 0, ',', '.'),
                    'saldo' => number_format($saldo, 0, ',', '.'),
                    'target_date' => \Carbon\Carbon::parse($p->target_date)->translatedFormat('d F Y'),
                    'status_text' => $progress >= 100
                        ? "<i class='bx bx-trophy text-success'></i> Tercapai"
                        : "<i class='bx bx-time text-warning'></i> Belum Tercapai",
                ];
            });

        return view('dashboard', compact(
            'totalSales',
            'totalPurchase',
            'profit',
            'totalTransactions',
            'salesPerMonth',
            'projectTargets',
            'currentCash',
            'growthIncome',
            'growthExpense',
            'growthProfit'
        ));
    }
}
