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
use App\Http\Controllers\Backend\ScheduleController;
use App\Http\Controllers\Backend\TransactionController;
use App\Http\Controllers\Backend\TournamentController;
use App\Http\Controllers\Ligapayo17Controller;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use App\Http\Controllers\TmpUploadController;
use SebastianBergmann\CodeCoverage\Report\Html\Dashboard;








Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/ligapayo17', [Ligapayo17Controller::class, 'index'])->name('ligapayo17.index');
Route::get('/ligapayo17/data', [Ligapayo17Controller::class, 'data'])->name('ligapayo17.data');



Route::middleware(['auth', 'roleAny'])->group(function () {
    Route::prefix('dashboard')->name('dashboard.')->middleware('permission:akses dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('index');     // halaman datatable + modal
        // untuk datatable AJAX
    });

    Route::get('/schedule/events', [ScheduleController::class, 'events'])->name('schedule.events');
    Route::post('/schedule', [ScheduleController::class, 'store'])->name('schedule.store');
    Route::put('/schedule/{schedule}', [ScheduleController::class, 'update'])->name('schedule.update');
    Route::delete('/schedule/{schedule}', [ScheduleController::class, 'destroy'])->name('schedule.destroy');
    //Transaction Routes
    Route::post('/sales', [TransactionController::class, 'createSale'])->name('sales.store');
    Route::post('/purchases', [TransactionController::class, 'createPurchase'])->name('purchases.store');

    //Penjualan View


    Route::prefix('penjualan')->name('penjualan.')->middleware('permission:akses penjualan')->group(function () {
        Route::get('/', [PenjualanController::class, 'index'])->name('index');          // halaman datatable + modal
        Route::get('/data', [PenjualanController::class, 'data'])->name('data');        // untuk datatable AJAX
    });

    Route::prefix('pembelian')->name('pembelian.')->middleware('permission:akses pembelian')->group(function () {
        Route::get('/', [PembelianController::class, 'index'])->name('index');          // halaman datatable + modal
        Route::get('/data', [PembelianController::class, 'data'])->name('data');        // untuk datatable AJAX
    });


    Route::prefix('cash')->name('cash.')->middleware('permission:akses kas transaksi')->group(function () {
        Route::get('/', [CashAndTransactionController::class, 'index'])->name('accounts');
        Route::get('/{account}/transactions', [CashAndTransactionController::class, 'transactions'])->name('transactions');
        Route::post('/accounts', [CashAndTransactionController::class, 'storeAccount'])->name('accounts.store');
        Route::post('/transactions', [CashAndTransactionController::class, 'storeTransaction'])->name('transactions.store');
    });

    Route::prefix('accounting')->middleware('permission:akses jurnal umum')->group(function () {
        Route::get('/', [JournalController::class, 'index'])->name('journals.index');
        Route::get('/journals/data', [JournalController::class, 'data'])->name('journals.data');

        // routes/web.php
        Route::get('/journals/{id}', [JournalController::class, 'show'])->name('journals.show');
        Route::get('/journals/{id}/lines', [JournalController::class, 'linesData'])->name('journals.lines.data');
    });

    Route::prefix('products')->name('products.')->middleware('permission:akses stok shuttlecock')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');          // halaman datatable + modal
        Route::get('/data', [ProductController::class, 'data'])->name('data');        // untuk datatable AJAX
        Route::post('/', [ProductController::class, 'store'])->name('store');         // simpan product baru
        Route::put('/{product}', [ProductController::class, 'update'])->name('update'); // update product
        Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy'); // hapus product

    });



    Route::prefix('reports')->name('reports.')->middleware('permission:akses laporan stok')->group(function () {

        Route::get('/stock', [ReportController::class, 'stock'])->name('stock');

        // datatables ajax

        Route::get('/stock/data', [ReportController::class, 'stockData'])->name('stock.data');
    });

    Route::prefix('projects')->name('projects.')->middleware('permission:akses target proyek')->group(function () {
        Route::get('/', [ProjectTargetController::class, 'index'])->name('index');
        Route::get('/data', [ProjectTargetController::class, 'data'])->name('data');
        Route::post('/', [ProjectTargetController::class, 'store'])->name('store');
        Route::patch('/{id}', [ProjectTargetController::class, 'update'])->name('update');
        Route::delete('/{id}', [ProjectTargetController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('tournament')->name('tournament.')->middleware('permission:akses tournament')->group(function () {
        Route::get('/', [TournamentController::class, 'index'])->name('index');
        Route::get('/data', [TournamentController::class, 'data'])->name('data');
        Route::post('/teams', [TournamentController::class, 'storeTeam'])->name('teams.store');
        Route::patch('/teams/{team}', [TournamentController::class, 'updateTeam'])->name('teams.update');
        Route::delete('/teams/{team}', [TournamentController::class, 'destroyTeam'])->name('teams.destroy');
        Route::post('/matches', [TournamentController::class, 'storeMatch'])->name('matches.store');
        Route::patch('/matches/{match}', [TournamentController::class, 'updateMatch'])->name('matches.update');
        Route::delete('/matches/{match}', [TournamentController::class, 'destroyMatch'])->name('matches.destroy');
    });

    Route::prefix('roles')->name('roles.')->middleware('permission:akses manajemen user')->group(function () {
        // /roles  → roles.index
        Route::get('/', [RoleManagementController::class, 'index'])->name('index');

        // /roles/datatable → roles.datatable
        Route::get('/datatable', [RoleManagementController::class, 'datatable'])->name('datatable');

        // CRUD role
        Route::post('/', [RoleManagementController::class, 'store'])->name('store');
        Route::put('/{role}', [RoleManagementController::class, 'update'])->name('update');
        Route::delete('/{role}', [RoleManagementController::class, 'destroy'])->name('destroy');

        // Tambah user ke role
        Route::post('/add-user', [RoleManagementController::class, 'addUser'])->name('addUser');

        // Ambil permissions milik role
        Route::get('/{role}/permissions', [RoleManagementController::class, 'getPermissions'])
            ->name('permissions');

        // Show profile user (LEBIH AMAN pakai prefix /user/)
        Route::get('/user/{user}', [RoleManagementController::class, 'showProfile'])
            ->name('users.show');
    });

    Route::put('/users/{user}/profile', [RoleManagementController::class, 'updateProfile'])->name('users.updateProfile');
    Route::put('/users/{user}/password', [RoleManagementController::class, 'updatePassword'])->name('users.updatePassword');
    Route::put('/users/{user}/photo-profile', [RoleManagementController::class, 'updatePhotoProfile'])->name('users.updatePhotoProfile');
    Route::put('/users/{user}/photo-house', [RoleManagementController::class, 'updatePhotoHouse'])->name('users.updatePhotoHouse');
    // web.php

});
