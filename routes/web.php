<?php

use App\Http\Controllers\Backend\CashAndTransactionController;
use App\Http\Controllers\Backend\PembelianController;
use App\Http\Controllers\Backend\PenjualanController;
use App\Http\Controllers\Backend\ProductController;
use App\Http\Controllers\Backend\TransactionController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});





Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'role:administrator'])->group(function () {
    //Transaction Routes
    Route::post('/sales', [TransactionController::class, 'createSale'])->name('sales.store');
    Route::post('/purchases', [TransactionController::class, 'createPurchase'])->name('purchases.store');

    //Penjualan View


    Route::prefix('penjualan')->name('penjualan.')->group(function () {
        Route::get('/', [PenjualanController::class, 'index'])->name('index');          // halaman datatable + modal
        Route::get('/data', [PenjualanController::class, 'data'])->name('data');        // untuk datatable AJAX
    });

    Route::prefix('pembelian')->name('pembelian.')->group(function () {
        Route::get('/', [PembelianController::class, 'index'])->name('index');          // halaman datatable + modal
        Route::get('/data', [PembelianController::class, 'data'])->name('data');        // untuk datatable AJAX
    });


    Route::prefix('cash')->name('cash.')->group(function () {
        Route::get('/', [CashAndTransactionController::class, 'index'])->name('accounts');
        Route::get('/{account}/transactions', [CashAndTransactionController::class, 'transactions'])->name('transactions');
        Route::post('/accounts', [CashAndTransactionController::class, 'storeAccount'])->name('accounts.store');
        Route::post('/transactions', [CashAndTransactionController::class, 'storeTransaction'])->name('transactions.store');
    });


    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');          // halaman datatable + modal
        Route::get('/data', [ProductController::class, 'data'])->name('data');        // untuk datatable AJAX
        Route::post('/', [ProductController::class, 'store'])->name('store');         // simpan product baru
        Route::put('/{product}', [ProductController::class, 'update'])->name('update'); // update product
        Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy'); // hapus product

    });
});
