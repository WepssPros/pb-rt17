<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Product;
use App\Models\Stock;
use App\Models\CashAccount;

class InitialSeeder extends Seeder
{
    public function run()
    {
        // Bola: per pcs
        $ball = Product::create([
            'sku' => 'BALL-001',
            'name' => 'Bola Latihan',
            'unit' => 'pcs',
            'unit_content' => 1,
            'cost_price' => 13000,
            'sell_price' => 15000,
        ]);
        Stock::create(['product_id' => $ball->id, 'quantity' => 100]); // 100 pcs

        // Shuttlecock: per tube (12 pcs)
        $tube = Product::create([
            'sku' => 'SHT-001',
            'name' => 'Shuttlecock Tabung',
            'unit' => 'tube',
            'unit_content' => 12,
            'cost_price' => 13000, // per pcs
            'sell_price' => 156000 / 12, // show sell_price per displayed unit; you may prefer per tube - adjust in UI
        ]);
        // seed 10 tubes -> 10*12 pcs
        Stock::create(['product_id' => $tube->id, 'quantity' => 10 * 12]);

        // Kas awal
        CashAccount::create(['name' => 'Kas Utama', 'code' => 'K001', 'balance' => 0]);
    }
}
