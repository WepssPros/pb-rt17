@extends('layouts.admin')

@section('title')
<title>Project Target - PB RT 17 KASAMBA</title>
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">

    <div class="card">
        <div class="card-datatable table-responsive">
            <table class="datatables-basic table border-top w-100">
                <thead>
                    <tr>
                        <th></th> <!-- Responsive Control -->
                        <th></th> <!-- Checkbox -->
                        <th>ID</th>
                        <th>Nama Proyek</th>
                        <th>Target Dana</th>
                        <th>Tanggal Target</th>
                        <th>Kas Terkait</th>
                        <th>Saldo Kas</th>
                        <th>Pencapaian</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
            </table>
        </div>
    </div>

    <hr class="my-12" />

</div>

<!-- Modal Tambah/Edit Project Target -->
<div class="modal fade" id="projectTargetModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-simple modal-edit-projecttarget">
        <div class="modal-content">
            <div class="modal-body">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                <div class="text-center mb-6">
                    <h4 class="mb-2" id="projectTargetModalTitle">Tambah / Edit Target Proyek</h4>
                    <p>Gunakan formulir ini untuk menambahkan atau memperbarui target proyek.</p>
                </div>
                <form id="projectTargetForm" class="row g-3">
                    <input type="hidden" name="project_target_id" value="">

                    <div class="col-12 col-md-6">
                        <label class="form-label" for="projectName">Nama Proyek</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bx bx-building-house"></i></span>
                            <input type="text" id="projectName" name="name" class="form-control"
                                placeholder="Contoh: Pembuatan Tiang" required>
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <label class="form-label" for="targetAmount">Target Dana</label>
                        <div class="input-group">
                            <span class="input-group-text">Rp</span>
                            <input type="text" id="targetAmount" name="target_amount" class="form-control"
                                placeholder="0" required>
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <label class="form-label" for="targetDate">Tanggal Target</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bx bx-calendar"></i></span>
                            <input type="date" id="targetDate" name="target_date" class="form-control" required>
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <label class="form-label" for="cashAccount">Sumber Kas</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bx bx-wallet"></i></span>
                            <select id="cashAccount" name="cash_account_id" class="form-select" required>
                                <option value="">-- Pilih Kas --</option>
                                @foreach(\App\Models\CashAccount::all() as $account)
                                <option value="{{ $account->id }}">{{ $account->name }} (Rp
                                    {{ number_format($account->balance, 0, ',', '.') }})
                                </option>
                                @endforeach
                            </select>
                        </div>
                    </div>

                    <div class="col-12 text-center mt-3">
                        <button type="submit" class="btn btn-primary me-3">Simpan</button>
                        <button type="reset" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
@vite('resources/js/projecttarget.js')
@endpush