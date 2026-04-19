<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('child_product_id')->nullable()->after('unit_content');
            $table->unsignedInteger('pcs_per_unit')->default(1)->after('child_product_id');

            $table->foreign('child_product_id')
                  ->references('id')
                  ->on('products')
                  ->nullOnDelete();
        });

        // === Buat produk baru: Bola Max Point Gold ===
        $goldBallId = DB::table('products')->insertGetId([
            'sku'          => 'BALL-002',
            'name'         => 'Bola Max Point Gold',
            'unit'         => 'pcs',
            'unit_content' => 1,
            'cost_price'   => 12083.33,
            'sell_price'   => 15000.00,
            'notes'        => 'Auto-created: pcs version of Shuttlecock Tabung Max Point Gold',
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        // Buat stock record untuk produk baru
        DB::table('stocks')->insert([
            'product_id' => $goldBallId,
            'quantity'   => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // === Mapping tube → pcs ===
        // SHT-001 (Shuttlecock Tabung Max Point) → BALL-001 (Bola Max Point), 12 pcs
        DB::table('products')
            ->where('sku', 'SHT-001')
            ->update(['child_product_id' => DB::table('products')->where('sku', 'BALL-001')->value('id'), 'pcs_per_unit' => 12]);

        // SHT-002 (Shuttlecock Tabung Max Point Gold) → BALL-002 (Bola Max Point Gold), 12 pcs
        DB::table('products')
            ->where('sku', 'SHT-002')
            ->update(['child_product_id' => $goldBallId, 'pcs_per_unit' => 12]);

        // PC-400 (Prochamps-400 tube) → BPC-400 (Bola Prochamps 400), 12 pcs
        DB::table('products')
            ->where('sku', 'PC-400')
            ->update(['child_product_id' => DB::table('products')->where('sku', 'BPC-400')->value('id'), 'pcs_per_unit' => 12]);

        // === Koreksi Stock ===
        // BALL-001: SHT-001 punya 3 tube → BALL-001 seharusnya 36 pcs (3 × 12)
        // Saat ini BALL-001 = 0, jadi tambah 36
        $ball001Id = DB::table('products')->where('sku', 'BALL-001')->value('id');
        $currentStock = DB::table('stocks')->where('product_id', $ball001Id)->value('quantity');
        $sht001Stock = DB::table('stocks')
            ->where('product_id', DB::table('products')->where('sku', 'SHT-001')->value('id'))
            ->value('quantity');
        $expectedPcs = $sht001Stock * 12;
        $adjustment = $expectedPcs - $currentStock;

        if ($adjustment != 0) {
            DB::table('stocks')
                ->where('product_id', $ball001Id)
                ->update(['quantity' => $expectedPcs, 'updated_at' => now()]);

            DB::table('stock_movements')->insert([
                'product_id'     => $ball001Id,
                'movement_type'  => 'adjustment',
                'quantity'       => $adjustment,
                'unit'           => 'pcs',
                'unit_quantity'  => $adjustment,
                'reference_type' => null,
                'reference_id'   => null,
                'cost_per_unit'  => null,
                'sell_price_per_unit' => null,
                'note'           => 'Auto-adjustment: sinkronisasi stock tube ↔ pcs (SHT-001 × 12)',
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }

        // SHT-002: Gold punya 0 tube → Bola Gold = 0 pcs (sudah benar)
        // PC-400: punya 1 tube → BPC-400 seharusnya 12 pcs
        $bpc400Id = DB::table('products')->where('sku', 'BPC-400')->value('id');
        $currentBpc = DB::table('stocks')->where('product_id', $bpc400Id)->value('quantity');
        $pc400Stock = DB::table('stocks')
            ->where('product_id', DB::table('products')->where('sku', 'PC-400')->value('id'))
            ->value('quantity');
        $expectedBpc = $pc400Stock * 12;
        $adjBpc = $expectedBpc - $currentBpc;

        if ($adjBpc != 0) {
            DB::table('stocks')
                ->where('product_id', $bpc400Id)
                ->update(['quantity' => $expectedBpc, 'updated_at' => now()]);

            DB::table('stock_movements')->insert([
                'product_id'     => $bpc400Id,
                'movement_type'  => 'adjustment',
                'quantity'       => $adjBpc,
                'unit'           => 'pcs',
                'unit_quantity'  => $adjBpc,
                'reference_type' => null,
                'reference_id'   => null,
                'cost_per_unit'  => null,
                'sell_price_per_unit' => null,
                'note'           => 'Auto-adjustment: sinkronisasi stock tube ↔ pcs (PC-400 × 12)',
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove child product mapping first
        DB::table('products')->update(['child_product_id' => null, 'pcs_per_unit' => 1]);

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['child_product_id']);
            $table->dropColumn(['child_product_id', 'pcs_per_unit']);
        });

        // Remove auto-created product
        $goldBallId = DB::table('products')->where('sku', 'BALL-002')->value('id');
        if ($goldBallId) {
            DB::table('stocks')->where('product_id', $goldBallId)->delete();
            DB::table('products')->where('id', $goldBallId)->delete();
        }
    }
};
