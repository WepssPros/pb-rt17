<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    public function index()
    {
        return view('journals.index');
    }

    public function data(Request $request)
    {
        if ($request->ajax()) {
            $journals = Journal::with('lines')->orderBy('date', 'desc');

            return datatables()->of($journals)
                ->addIndexColumn()
                ->addColumn('date', function ($j) {
                    return '<span class="badge bg-primary">
                                <i class="bx bx-calendar me-1"></i>' . date('d-m-Y', strtotime($j->date)) . '
                            </span>';
                })
                ->addColumn('reference', function ($j) {
                    if (!$j->reference_type) {
                        return '<span class="badge bg-label-secondary">-</span>';
                    }

                    // Format teks referensi (misal: "Invoice #12345")
                    $refText = $j->reference_type . ' #' . $j->reference_id;

                    // Jika terlalu panjang, potong jadi maksimal 20 karakter
                    $short = strlen($refText) > 20 ? substr($refText, 0, 20) . '…' : $refText;

                    return '<span class="badge bg-info text-white" 
                style="font-size: 0.85rem;"
                data-bs-toggle="tooltip" 
                title="' . e($refText) . '">
                <i class="bx bx-file me-1"></i>' . e($short) . '
            </span>';
                })

                ->addColumn('memo', function ($j) {
                    return e($j->memo ?? '-');
                })
                ->addColumn('debit_total', function ($j) {
                    $sum = $j->lines->sum('debit');
                    return '<span style="color:green;font-weight:bold;">Rp ' . number_format($sum, 0, ',', '.') . '</span>';
                })
                ->addColumn('credit_total', function ($j) {
                    $sum = $j->lines->sum('credit');
                    return '<span style="color:red;font-weight:bold;">Rp ' . number_format($sum, 0, ',', '.') . '</span>';
                })
                ->addColumn('action', function ($j) {
                    return '
                        <a href="' . route('journals.show', $j->id) . '" class="btn btn-sm btn-outline-info">
                            <i class="bx bx-detail"></i> Detail
                        </a>
                    ';
                })

                ->rawColumns(['date', 'debit_total', 'credit_total', 'action', 'reference', 'memo'])
                ->make(true);
        }
    }

    public function show($id)
    {
        $journal = Journal::findOrFail($id);
        return view('journals.show', compact('journal'));
    }

    public function linesData($id)
    {
        $journal = Journal::with('lines')->findOrFail($id);
        $lines = $journal->lines;

        return datatables()->of($lines)
            ->addIndexColumn()
            ->addColumn('account', function ($line) {
                $account = $line->account ?? '-';
                return '<span class="badge bg-secondary text-white px-2 py-1">
                <i class="bx bx-book me-1"></i>' . e($account) . '
            </span>';
            })

            ->addColumn('description', function ($line) {
                return e($line->description ?? '-');
            })
            ->addColumn('debit', function ($line) {
                return '<span style="color:green;font-weight:bold;">Rp ' . number_format($line->debit, 0, ',', '.') . '</span>';
            })
            ->addColumn('credit', function ($line) {
                return '<span style="color:red;font-weight:bold;">Rp ' . number_format($line->credit, 0, ',', '.') . '</span>';
            })
            ->rawColumns(['account', 'debit', 'credit'])
            ->make(true);
    }
}
