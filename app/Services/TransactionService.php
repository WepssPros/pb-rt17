<?php

namespace App\Services;

use App\Models\{Product, Stock, StockMovement, Sale, SaleItem, Purchase, PurchaseItem, CashAccount, CashTransaction, Journal, JournalLine};
use Illuminate\Support\Facades\DB;

class TransactionService
{
    public function createSale(array $payload)
    {
        return DB::transaction(function () use ($payload) {
            $sale = Sale::create([
                'invoice_no' => $payload['invoice_no'] ?? null,
                'sale_date' => $payload['sale_date'] ?? now()->toDateString(),
                'total' => 0,
                'paid' => $payload['paid'] ?? 0,
                'customer' => $payload['customer'] ?? null,
            ]);

            $total = 0;
            $total_cost = 0;

            foreach ($payload['items'] as $it) {
                $product = Product::findOrFail($it['product_id']);
                $baseQty = $product->toBaseQty($it['qty'], $it['unit'] ?? null);

                $stock = Stock::firstOrCreate(['product_id' => $product->id]);
                if ($stock->quantity < $baseQty) {
                    throw new \Exception('Stok tidak cukup untuk produk: ' . $product->name);
                }
                $stock->quantity -= $baseQty;
                $stock->save();

                StockMovement::create([
                    'product_id' => $product->id,
                    'movement_type' => 'sale',
                    'quantity' => -1 * $baseQty,
                    'unit' => $it['unit'] ?? $product->unit,
                    'unit_quantity' => $it['qty'],
                    'reference_type' => Sale::class,
                    'reference_id' => $sale->id,
                    'cost_per_unit' => $product->cost_price,
                    'sell_price_per_unit' => $it['sell_price'] ?? $product->sell_price,
                ]);

                $linePrice = ($it['sell_price'] ?? $product->sell_price) * $it['qty'];
                $lineCost = $product->cost_price * $baseQty;

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'qty' => $it['qty'],
                    'unit' => $it['unit'] ?? $product->unit,
                    'sell_price' => $it['sell_price'] ?? $product->sell_price,
                    'line_total' => $linePrice,
                ]);

                $total += $linePrice;
                $total_cost += $lineCost;
            }

            $sale->total = $total;
            $sale->save();

            if (!empty($payload['paid']) && !empty($payload['cash_account_id'])) {
                $cash = CashAccount::findOrFail($payload['cash_account_id']);
                $cash->balance += $payload['paid'];
                $cash->save();

                CashTransaction::create([
                    'cash_account_id' => $cash->id,
                    'type' => 'in',
                    'amount' => $payload['paid'],
                    'reference_type' => Sale::class,
                    'reference_id' => $sale->id,
                    'description' => 'Penjualan #' . $sale->invoice_no,
                ]);
            }

            $journal = Journal::create([
                'reference_type' => Sale::class,
                'reference_id' => $sale->id,
                'date' => $sale->sale_date,
                'memo' => 'Penjualan ' . $sale->invoice_no,
            ]);

            if (!empty($payload['paid'])) {
                JournalLine::create(['journal_id' => $journal->id, 'account' => 'Cash', 'debit' => $payload['paid'], 'credit' => 0, 'note' => 'Tunai dari penjualan']);
            }

            JournalLine::create(['journal_id' => $journal->id, 'account' => 'Sales Revenue', 'debit' => 0, 'credit' => $total, 'note' => 'Pendapatan penjualan']);
            JournalLine::create(['journal_id' => $journal->id, 'account' => 'COGS', 'debit' => $total_cost, 'credit' => 0, 'note' => 'Harga pokok terjual']);
            JournalLine::create(['journal_id' => $journal->id, 'account' => 'Inventory', 'debit' => 0, 'credit' => $total_cost, 'note' => 'Pengurangan persediaan']);

            return $sale;
        });
    }

    public function createPurchase(array $payload)
    {
        return DB::transaction(function () use ($payload) {
            $purchase = Purchase::create([
                'reference_no' => $payload['reference_no'] ?? null,
                'purchase_date' => $payload['purchase_date'] ?? now()->toDateString(),
                'total' => 0,
                'paid' => $payload['paid'] ?? 0,
                'supplier' => $payload['supplier'] ?? null,
            ]);

            $total = 0;
            foreach ($payload['items'] as $it) {
                $product = Product::findOrFail($it['product_id']);
                $baseQty = $product->toBaseQty($it['qty'], $it['unit'] ?? null);

                $lineCostPerBase = $it['cost_per_unit'];
                $lineTotal = $lineCostPerBase * $baseQty;

                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $product->id,
                    'qty' => $it['qty'],
                    'unit' => $it['unit'] ?? $product->unit,
                    'cost_per_unit' => $lineCostPerBase,
                    'line_total' => $lineTotal,
                ]);

                $stock = Stock::firstOrCreate(['product_id' => $product->id]);
                $stock->quantity += $baseQty;
                $stock->save();

                StockMovement::create([
                    'product_id' => $product->id,
                    'movement_type' => 'purchase',
                    'quantity' => $baseQty,
                    'unit' => $it['unit'] ?? $product->unit,
                    'unit_quantity' => $it['qty'],
                    'reference_type' => Purchase::class,
                    'reference_id' => $purchase->id,
                    'cost_per_unit' => $lineCostPerBase,
                ]);

                $total += $lineTotal;
            }

            $purchase->total = $total;
            $purchase->save();

            if (!empty($payload['paid']) && !empty($payload['cash_account_id'])) {
                $cash = CashAccount::findOrFail($payload['cash_account_id']);
                $cash->balance -= $payload['paid'];
                $cash->save();

                CashTransaction::create([
                    'cash_account_id' => $cash->id,
                    'type' => 'out',
                    'amount' => $payload['paid'],
                    'reference_type' => Purchase::class,
                    'reference_id' => $purchase->id,
                    'description' => 'Pembelian #' . $purchase->reference_no,
                ]);
            }

            $journal = Journal::create(['reference_type' => Purchase::class, 'reference_id' => $purchase->id, 'date' => $purchase->purchase_date, 'memo' => 'Pembelian ' . $purchase->reference_no]);
            JournalLine::create(['journal_id' => $journal->id, 'account' => 'Inventory', 'debit' => $total, 'credit' => 0, 'note' => 'Penambahan inventory']);
            JournalLine::create(['journal_id' => $journal->id, 'account' => 'Cash', 'debit' => 0, 'credit' => $payload['paid'] ?? 0, 'note' => 'Pembayaran']);

            return $purchase;
        });
    }
}
