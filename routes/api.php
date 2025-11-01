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
        'fotorumah' => 'public/tmp/foto_rumah',
        'fotoprofile' => 'public/tmp/foto_profile',
        default => 'public/tmp/other',
    };

    $file = $request->file('file');
    $filename = $file->hashName();
    $file->storeAs($folder, $filename);

    // 🚀 hasil path publik
    $publicPath = asset(str_replace('public/', 'storage/', $folder) . '/' . $filename);

    return response()->json([
        'success' => true,
        'filename' => $filename,
        'url' => $publicPath, // 👉 Dropzone bisa langsung tampilkan preview dari sini
    ]);
});
