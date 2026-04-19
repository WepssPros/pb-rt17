<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

Route::post('/sales', [TransactionController::class, 'storeSale']);
Route::post('/purchases', [TransactionController::class, 'storePurchase']);





