<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->nullable()->unique();
            $table->string('name');
            $table->string('unit')->default('pcs'); // displayed unit: 'pcs' or 'tube'
            $table->unsignedInteger('unit_content')->default(1); // e.g. 12 for tube
            $table->decimal('cost_price', 15, 2)->default(0); // cost per base unit (pcs)
            $table->decimal('sell_price', 15, 2)->default(0); // sell price per displayed unit
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
