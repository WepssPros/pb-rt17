@extends('layouts.admin')

@section('title')
<title>Rekap Stok - PB RT 17 KASAMBA</title>
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">

    {{-- Tombol kembali --}}
    <div class="mb-3">
        <a href="{{ route('dashboard') }}" class="btn btn-info">
            <i class="bx bx-arrow-back me-1"></i> Kembali
        </a>
    </div>

    {{-- Card utama --}}
    <div class="card">
        <div class="card-datatable table-responsive">
            <table class="datatables-basic table table-bordered">
                <thead>
                    <tr>
                        <th></th> <!-- responsive control -->
                        <th></th> <!-- hidden ID / checkbox -->
                        <th>ID</th> <!-- internal ID, bisa disembunyikan -->
                        <th><i class="bx bx-package me-1"></i> Produk</th>
                        <th><i class="bx bx-barcode me-1"></i> SKU</th>
                        <th><i class="bx bx-grid me-1"></i> Stock Awal</th>
                        <th><i class="bx bx-down-arrow-alt me-1"></i> Masuk</th>
                        <th><i class="bx bx-up-arrow-alt me-1"></i> Keluar</th>
                        <th><i class="bx bx-sync me-1"></i> Stock Akhir</th>
                        <th><i class="bx bx-cog me-1"></i> Satuan</th>
                    </tr>
                </thead>
                <tbody>
                    {{-- Data akan di-load via AJAX --}}
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection

@push('scripts')
@vite('resources/js/stock.js')
@endpush