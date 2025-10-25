<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TransactionService;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    protected $service;
    public function __construct(TransactionService $service)
    {
        $this->service = $service;
    }

    public function storeSale(Request $request)
    {
        $data = $request->validate([
            'invoice_no' => 'nullable|string',
            'sale_date' => 'nullable|date',
            'customer' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit' => 'nullable|string',
            'items.*.sell_price' => 'nullable|numeric',
            'paid' => 'nullable|numeric',
            'cash_account_id' => 'nullable|integer',
        ]);

        $sale = $this->service->createSale($data);
        return response()->json($sale, 201);
    }

    public function storePurchase(Request $request)
    {
        $data = $request->validate([
            'reference_no' => 'nullable|string',
            'purchase_date' => 'nullable|date',
            'supplier' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit' => 'nullable|string',
            'items.*.cost_per_unit' => 'required|numeric',
            'paid' => 'nullable|numeric',
            'cash_account_id' => 'nullable|integer',
        ]);

        $purchase = $this->service->createPurchase($data);
        return response()->json($purchase, 201);
    }
}
