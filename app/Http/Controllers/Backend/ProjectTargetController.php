<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\ProjectTarget;
use App\Models\CashAccount;
use Illuminate\Http\Request;

class ProjectTargetController extends Controller
{
    public function index()
    {
        return view('projecttarget.index');
    }

    public function data()
    {
        $targets = ProjectTarget::with('cashAccount')->latest();

        return datatables()->of($targets)
            ->addColumn('checkbox', fn($t) => $t->id)
            ->addColumn('cash_account_name', fn($t) => $t->cashAccount?->name ?? '-')
            ->addColumn('cash_account_balance', fn($t) => $t->cashAccount?->balance ?? 0)
            ->addColumn('target_amount', fn($t) => $t->target_amount)
            ->addColumn('target_date', fn($t) => $t->target_date)
            ->addColumn('achievement', fn($t) => $t->achievement)
            ->addColumn('status', fn($t) => $t->status)
            ->addColumn('actions', fn($t) => $t->id) // biar ID dikirim, tombol dibuat di JS
            ->make(true);
    }
    



    /**
     * Store a newly created project target.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'target_date' => 'nullable|date',
            'cash_account_id' => 'nullable|exists:cash_accounts,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $cashAccount = CashAccount::find($validated['cash_account_id']);
        $saldoKas = $cashAccount?->balance ?? 0;
        $achievement = $validated['target_amount'] > 0
            ? min(($saldoKas / $validated['target_amount']) * 100, 100)
            : 0;
        $status = $achievement >= 100 ? 'Tercapai' : 'Belum Tercapai';

        $target = ProjectTarget::create([
            ...$validated,
            'achievement' => $achievement,
            'status' => $status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Target proyek berhasil ditambahkan.',
            'data' => $target
        ]);
    }

    /**
     * Update the specified project target.
     */
    public function update(Request $request, $id)
    {
        $target = ProjectTarget::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'target_date' => 'nullable|date',
            'cash_account_id' => 'nullable|exists:cash_accounts,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $cashAccount = CashAccount::find($validated['cash_account_id']);
        $saldoKas = $cashAccount?->balance ?? 0;
        $achievement = $validated['target_amount'] > 0
            ? min(($saldoKas / $validated['target_amount']) * 100, 100)
            : 0;
        $status = $achievement >= 100 ? 'Tercapai' : 'Belum Tercapai';

        $target->update([
            ...$validated,
            'achievement' => $achievement,
            'status' => $status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data target proyek berhasil diperbarui.',
            'data' => $target
        ]);
    }

    /**
     * Remove the specified project target.
     */
    public function destroy($id)
    {
        $target = ProjectTarget::findOrFail($id);
        $target->delete();

        return response()->json([
            'success' => true,
            'message' => 'Target proyek berhasil dihapus.',
        ]);
    }
}
