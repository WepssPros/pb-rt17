<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CashAccount;
use App\Models\CashTransaction;

class CashAndTransactionController extends Controller
{
    // List semua Cash Account
    // Daftar akun kas
    public function index(Request $request)
    {
        if ($request->ajax()) {
            $accounts = CashAccount::query();

            return datatables()->of($accounts)

                ->addColumn('balance', function ($account) {
                    $color = $account->balance < 0 ? 'danger' : 'success'; // merah jika minus, hijau jika positif
                    return '<span class="badge bg-' . $color . '">Rp ' . number_format($account->balance, 0, ',', '.') . '</span>';
                })


                ->addColumn('action', function ($account) {
                    return '<a href="' . route('cash.transactions', $account->id) . '" class="btn btn-sm btn-primary">
                <i class="bx bx-detail"></i>
            </a>';
                })
                ->rawColumns(['action', 'balance'])
                ->make(true);
        }

        return view('cash.index');
    }

    // Tampilkan transaksi per akun
    public function transactions(Request $request, CashAccount $account)
    {
        if ($request->ajax()) {
            // Ambil transaksi dari paling lama → paling baru untuk hitung saldo
            $transactions = $account->transactions()->orderBy('created_at', 'asc')->get();

            $runningBalance = 0; // mulai dari 0
            $runningBalances = [];

            foreach ($transactions as $tx) {
                $runningBalance += $tx->type === 'in' ? $tx->amount : -$tx->amount;
                $runningBalances[$tx->id] = $runningBalance;
            }



            // Balik urutan untuk tampil di datatable: terbaru di atas
            $transactions = $transactions->reverse();

            return datatables()->of($transactions)
                ->addIndexColumn()
                ->addColumn('type_label', function ($tx) {
                    return $tx->type === 'in'
                        ? '<span class="badge bg-success"><i class="bx bx-chevron-down-circle me-1"></i>Debit</span>'
                        : '<span class="badge bg-danger"><i class="bx bx-chevron-up-circle me-1"></i>Kredit</span>';
                })
                ->addColumn('created_at', function ($tx) {
                    return '<span class="badge bg-primary"><i class="bx bx-calendar me-1"></i>'
                        . $tx->created_at->format('d-m-Y') . '</span>';
                })
                ->addColumn('amount', function ($tx) {
                    $color = $tx->type === 'in' ? 'green' : 'red';
                    $formatted = 'Rp ' . number_format($tx->amount, 0, ',', '.');
                    return '<span style="color:' . $color . '; font-weight:bold; font-style:italic;">' . $formatted . '</span>';
                })
                ->addColumn('saldo_after', function ($tx) use ($runningBalances) {
                    $saldo = $runningBalances[$tx->id] ?? 0;
                    $color = $saldo < 0 ? 'red' : 'blue';
                    return '<span style="color:' . $color . '; font-weight:bold;">Rp ' . number_format($saldo, 0, ',', '.') . '</span>';
                })
                ->addColumn('reference', function ($tx) {
                    return $tx->reference_type ? class_basename($tx->reference_type) . ' #' . $tx->reference_id : '-';
                })
                ->rawColumns(['type_label', 'created_at', 'amount', 'saldo_after'])
                ->make(true);
        }


        return view('cash.transactions', compact('account'));
    }


    // Tambah Cash Account baru
    public function storeAccount(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'code' => 'required|string|unique:cash_accounts,code',
            'balance' => 'nullable|numeric'
        ]);

        $account = CashAccount::create($data);
        return redirect()->back()->with('success', 'Akun kas berhasil ditambahkan.');
    }





    // Tambah transaksi kas
    public function storeTransaction(Request $request)
    {
        $data = $request->validate([
            'cash_account_id' => 'required|exists:cash_accounts,id',
            'type' => 'required|in:in,out',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'reference_type' => 'nullable|string',
            'reference_id' => 'nullable|integer'
        ]);

        $transaction = CashTransaction::create($data);

        // update saldo akun secara realtime
        $account = CashAccount::find($data['cash_account_id']);
        if ($data['type'] === 'in') {
            $account->balance += $data['amount'];
        } else {
            $account->balance -= $data['amount'];
        }
        $account->save();

        return redirect()->back()->with('success', 'Transaksi berhasil ditambahkan.');
    }
}
