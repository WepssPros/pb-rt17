@extends('layouts.admin')
@section('title')
<title>Akun Kas - PB RT 17 KASAMBA</title>
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">

    <div class="card">

        <div class="card-datatable table-responsive">
            <table class="datatables-basic table table-bordered">
                <thead>
                    <tr>
                        <th></th> <!-- Kontrol responsif -->
                        <th></th> <!-- Kotak centang -->
                        <th>ID</th> <!-- ID tersembunyi -->
                        <th>Nama Akun</th>
                        <th>Kode</th>
                        <th>Saldo</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {{-- Jika server-side, bisa kosong. Data akan di-load via JS --}}
                </tbody>
            </table>
        </div>
    </div>

</div>

{{-- Modal Tambah Akun --}}
<div class="modal fade" id="addAccountModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-simple modal-edit-account">
        <div class="modal-content">
            <div class="modal-body">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                <div class="text-center mb-6">
                    <h4 class="mb-2" id="accountModalTitle">Tambah Akun Kas</h4>
                    <p>Formulir ini digunakan untuk menambahkan akun kas baru.</p>
                </div>

                <form id="accountForm" class="row g-3" method="POST" action="{{ route('cash.accounts.store') }}">
                    @csrf


                    <div class="col-12 col-md-6">
                        <label class="form-label" for="accountName">Nama Akun</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class='bx bx-wallet'></i></span>
                            <input type="text" id="accountName" name="name" class="form-control" placeholder="Nama Akun"
                                required>
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <label class="form-label" for="accountCode">Kode</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class='bx bx-barcode'></i></span>
                            <input type="text" id="accountCode" name="code" class="form-control" placeholder="Kode Akun"
                                required>
                        </div>
                    </div>

                    <div class="col-12 col-md-12">
                        <label class="form-label" for="accountBalance">Saldo Awal</label>
                        <div class="input-group">
                            <span class="input-group-text">Rp</span>
                            <input type="text" id="accountBalance" class="form-control" value="0">
                            <input type="hidden" id="accountBalanceRaw" name="balance" value="0">
                        </div>
                    </div>

                    <div class="col-12 text-center mt-3">
                        <button type="submit" class="btn btn-primary me-3">Simpan Akun</button>
                        <button type="reset" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
@vite('resources/js/cash.js')
@endpush