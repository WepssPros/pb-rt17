<?php

use App\Http\Controllers\Backend\CashAndTransactionController;
use App\Http\Controllers\Backend\DashboardController;
use App\Http\Controllers\Backend\JournalController;
use App\Http\Controllers\Backend\PembelianController;
use App\Http\Controllers\Backend\PenjualanController;
use App\Http\Controllers\Backend\ProductController;
use App\Http\Controllers\Backend\ProjectTargetController;
use App\Http\Controllers\Backend\ReportController;
use App\Http\Controllers\Backend\RoleManagementController;
use App\Http\Controllers\Backend\TransactionController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use SebastianBergmann\CodeCoverage\Report\Html\Dashboard;








Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'roleAny'])->group(function () {
    Route::prefix('dashboard')->name('dashboard.')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('index');     // halaman datatable + modal
        // untuk datatable AJAX
    });

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

    Route::prefix('accounting')->group(function () {
        Route::get('/', [JournalController::class, 'index'])->name('journals.index');
        Route::get('/journals/data', [JournalController::class, 'data'])->name('journals.data');

        // routes/web.php
        Route::get('/journals/{id}', [JournalController::class, 'show'])->name('journals.show');
        Route::get('/journals/{id}/lines', [JournalController::class, 'linesData'])->name('journals.lines.data');
    });

    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');          // halaman datatable + modal
        Route::get('/data', [ProductController::class, 'data'])->name('data');        // untuk datatable AJAX
        Route::post('/', [ProductController::class, 'store'])->name('store');         // simpan product baru
        Route::put('/{product}', [ProductController::class, 'update'])->name('update'); // update product
        Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy'); // hapus product

    });



    Route::prefix('reports')->name('reports.')->group(function () {

        Route::get('/stock', [ReportController::class, 'stock'])->name('stock');

        // datatables ajax

        Route::get('/stock/data', [ReportController::class, 'stockData'])->name('stock.data');
    });

    Route::prefix('projects')->name('projects.')->group(function () {
        Route::get('/', [ProjectTargetController::class, 'index'])->name('index');
        Route::get('/data', [ProjectTargetController::class, 'data'])->name('data');
        Route::post('/', [ProjectTargetController::class, 'store'])->name('store');
        Route::patch('/{id}', [ProjectTargetController::class, 'update'])->name('update');
        Route::delete('/{id}', [ProjectTargetController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('roles')->name('roles.')->group(function () {
        Route::get('/', [RoleManagementController::class, 'index'])->name('index');
        Route::post('/', [RoleManagementController::class, 'store'])->name('store');
        Route::put('/{role}', [RoleManagementController::class, 'update'])->name('update');
        Route::delete('/{role}', [RoleManagementController::class, 'destroy'])->name('destroy');
        // web.php
        Route::post('/add-user', [RoleManagementController::class, 'addUser'])->name('addUser');

        Route::get('/{role}/permissions', [RoleManagementController::class, 'getPermissions']);
    });
});
