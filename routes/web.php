<?php

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
    Route::post('/sales', [TransactionController::class, 'createSale'])->name('sales.store');
    Route::post('/purchases', [TransactionController::class, 'createPurchase'])->name('purchases.store');



    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');          // halaman datatable + modal
        Route::get('/data', [ProductController::class, 'data'])->name('data');        // untuk datatable AJAX
        Route::post('/', [ProductController::class, 'store'])->name('store');         // simpan product baru
        Route::put('/{product}', [ProductController::class, 'update'])->name('update'); // update product
        Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy'); // hapus product
       
    });
});
