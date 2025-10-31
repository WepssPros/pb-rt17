<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Log;

Route::post('/sales', [TransactionController::class, 'storeSale']);
Route::post('/purchases', [TransactionController::class, 'storePurchase']);





Route::post('/tmp-upload/{type}', function (Request $request, $type) {
    if (!$request->hasFile('file')) {
        return response()->json(['error' => 'No file uploaded'], 400);
    }

    $folder = match ($type) {
        'fotorumah' => 'tmp/foto_rumah',
        'fotoprofile' => 'tmp/foto_profile',
        default => 'tmp/other',
    };

    $file = $request->file('file');
    $filename = $file->hashName();
    $file->storeAs($folder, $filename);

    // 🚀 HARUS JSON OBJEK — bukan string
    return response()->json([
        'success' => true,
        'filename' => $filename,
    ]);
});
