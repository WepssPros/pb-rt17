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
        Schema::create('project_targets', function (Blueprint $table) {
           
            $table->id();
            $table->string('name'); // contoh: "Pembuatan Tiang"
            $table->decimal('target_amount', 15, 2)->default(0); // contoh: 2500000.00
            $table->date('target_date')->nullable(); // contoh: "2024-12-31"
            $table->unsignedBigInteger('cash_account_id')->nullable(); // relasi ke kas


            $table->foreign('cash_account_id')->references('id')->on('cash_accounts')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_targets');
    }
};
