@extends('layouts.admin')

@section('title')
<link rel="stylesheet" href="../../be_view/assets/vendor/css/pages/page-profile.css" />
<title>User Profile - PB RT 17 KASAMBA</title>
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">
    <!-- Header -->
    <div class="row">
        <div class="col-12">
            <div class="card mb-6">
                {{-- Banner / Background pakai foto rumah user --}}
                <div class="user-profile-header-banner">
                    <img src="{{ $user->foto_rumah_url }}" alt="Banner image" class="rounded-top w-100"
                        style="max-height: 220px; object-fit: cover;" />
                </div>

                <div class="user-profile-header d-flex flex-column flex-lg-row text-sm-start text-center mb-8">
                    <div class="flex-shrink-0 mt-1 mx-sm-0 mx-auto">
                        {{-- Foto profil user --}}
                        <img src="{{ $user->foto_profile_url }}" alt="user image"
                            class="d-block h-auto ms-0 ms-sm-6 rounded-3 user-profile-img"
                            style="width: 120px; height: 120px; object-fit: cover;" />
                    </div>

                    <div class="flex-grow-1 mt-3 mt-lg-5">
                        <div
                            class="d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start mx-5 flex-md-row flex-column gap-4">
                            <div class="user-profile-info">
                                {{-- Nama user --}}
                                <h4 class="mb-2 mt-lg-7">{{ $user->name }}</h4>

                                @php
                                $roleNames = $user->roles->pluck('name')->implode(', ');
                                $roleLabel = $roleNames !== '' ? $roleNames : 'Belum ada role';
                                $alamat = trim(($user->perumahan ?? '') . ' Blok ' . ($user->blok_rumah ?? '') . ' No. '
                                .
                                ($user->no_rumah ?? ''), ' .');
                                @endphp

                                <ul
                                    class="list-inline mb-0 d-flex align-items-center flex-wrap justify-content-sm-start justify-content-center gap-4 mt-4">

                                    {{-- "Jabatan" / role user --}}
                                    <li class="list-inline-item">
                                        <i class="bx bx-palette me-2 align-top"></i>
                                        <span class="fw-medium">
                                            {{ $roleLabel }}
                                        </span>
                                    </li>

                                    {{-- Alamat / lokasi --}}
                                    <li class="list-inline-item">
                                        <i class="bx bx-map me-2 align-top"></i>
                                        <span class="fw-medium">
                                            {{ $alamat !== 'Blok  No.' ? $alamat : 'Alamat belum diisi' }}
                                        </span>
                                    </li>

                                    {{-- Joined at --}}
                                    <li class="list-inline-item">
                                        <i class="bx bx-calendar me-2 align-top"></i>
                                        <span class="fw-medium">
                                            Joined {{ $user->created_at?->format('d M Y') }}
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {{-- Tombol opsional, misal untuk edit --}}
                            @if(auth()->id() === $user->id)
                            <a href="javascript:void(0)" class="btn btn-primary mb-1" data-bs-toggle="modal"
                                data-bs-target="#modalEditDataUser">
                                <i class="bx bx-user-check bx-sm me-2"></i>Edit Profil
                            </a>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!--/ Header -->

    <!-- Navbar pills -->
    <div class="row">
        <div class="col-md-12">
            <div class="nav-align-top">
                <ul class="nav nav-pills flex-column flex-sm-row mb-6">
                    <li class="nav-item">
                        <a class="nav-link active" href="javascript:void(0);"><i class="bx bx-user bx-sm me-1_5"></i>
                            Profile</a>
                    </li>

                </ul>
            </div>
        </div>
    </div>
    <!--/ Navbar pills -->

    <!-- User Profile Content -->
    <div class="row">
        <div class="col-xl-4 col-lg-5 col-md-5">
            <!-- About User -->
            <div class="card mb-6">
                <div class="card-body">
                    <small class="card-text text-uppercase text-muted small">About</small>

                    @php
                    // Mapping status sederhana (sesuaikan kalau di DB beda)
                    $statusMap = [
                    1 => 'Pending',
                    2 => 'Active',
                    3 => 'Inactive',
                    ];
                    $statusLabel = $statusMap[$user->status ?? 2] ?? 'Active';
                    $roleNames = $user->roles->pluck('name')->implode(', ');
                    @endphp

                    <ul class="list-unstyled my-3 py-1">
                        <li class="d-flex align-items-center mb-4">
                            <i class="bx bx-user"></i>
                            <span class="fw-medium mx-2">Full Name:</span>
                            <span>{{ $user->name }}</span>
                        </li>
                        <li class="d-flex align-items-center mb-4">
                            <i class="bx bx-id-card"></i>
                            <span class="fw-medium mx-2">Username:</span>
                            <span>{{ $user->username ?? '-' }}</span>
                        </li>
                        <li class="d-flex align-items-center mb-4">
                            <i class="bx bx-check"></i>
                            <span class="fw-medium mx-2">Status:</span>
                            <span>{{ $statusLabel }}</span>
                        </li>
                        <li class="d-flex align-items-center mb-4">
                            <i class="bx bx-crown"></i>
                            <span class="fw-medium mx-2">Role:</span>
                            <span>{{ $roleNames !== '' ? $roleNames : 'Belum ada role' }}</span>
                        </li>
                        <li class="d-flex align-items-center mb-4">
                            <i class="bx bx-home-alt"></i>
                            <span class="fw-medium mx-2">Perumahan:</span>
                            <span>{{ $user->perumahan ?? '-' }}</span>
                        </li>
                        <li class="d-flex align-items-center mb-2">
                            <i class="bx bx-map"></i>
                            <span class="fw-medium mx-2">Alamat Rumah:</span>
                            <span>
                                Blok {{ $user->blok_rumah ?? '-' }}, No. {{ $user->no_rumah ?? '-' }}
                            </span>
                        </li>
                    </ul>

                    <small class="card-text text-uppercase text-muted small">Contacts</small>
                    <ul class="list-unstyled my-3 py-1">
                        <li class="d-flex align-items-center mb-4">
                            <i class="bx bx-phone"></i>
                            <span class="fw-medium mx-2">Contact:</span>
                            <span>{{ $user->phone_number ?? '-' }}</span>
                        </li>
                        <li class="d-flex align-items-center mb-4">
                            <i class="bx bx-envelope"></i>
                            <span class="fw-medium mx-2">Email:</span>
                            <span>{{ $user->email }}</span>
                        </li>
                    </ul>

                    <small class="card-text text-uppercase text-muted small">Teams / Roles</small>
                    <ul class="list-unstyled mb-0 mt-3 pt-1">
                        @forelse ($user->roles as $role)
                        <li class="d-flex flex-wrap mb-2">
                            <span class="fw-medium me-2">{{ $role->name }}</span>
                        </li>
                        @empty
                        <li class="d-flex flex-wrap mb-2">
                            <span class="text-muted">User belum memiliki role</span>
                        </li>
                        @endforelse
                    </ul>
                </div>
            </div>
            <!--/ About User -->

        </div>
        <div class="col-xl-8 col-lg-7 col-md-7">
            <!-- Profile Actions -->
            @if(auth()->id() === $user->id)
            <div class="card card-action mb-6">
                <div class="card-header align-items-center justify-content-between">
                    <h5 class="card-action-title mb-0">
                        <i class="bx bx-bar-chart-alt-2 bx-lg text-body me-4"></i>Pengaturan Profil
                    </h5>
                    <small class="text-muted">Kelola data & foto user</small>
                </div>

                <div class="card-body pt-3">
                    <div class="d-grid gap-3">
                        {{-- Edit data dasar: nama, username, kontak, alamat --}}
                        <button type="button"
                            class="btn btn-outline-primary d-flex justify-content-between align-items-center"
                            data-bs-toggle="modal" data-bs-target="#modalEditDataUser">
                            <span>
                                <i class="bx bx-user me-2"></i>
                                Edit Data Profil
                            </span>
                            <i class="bx bx-chevron-right"></i>
                        </button>

                        {{-- Edit foto profil --}}
                        <button type="button"
                            class="btn btn-outline-secondary d-flex justify-content-between align-items-center"
                            data-bs-toggle="modal" data-bs-target="#modalEditFotoProfil">
                            <span>
                                <i class="bx bx-image-alt me-2"></i>
                                Edit Foto Profil
                            </span>
                            <i class="bx bx-chevron-right"></i>
                        </button>

                        {{-- Edit foto rumah --}}
                        <button type="button"
                            class="btn btn-outline-secondary d-flex justify-content-between align-items-center"
                            data-bs-toggle="modal" data-bs-target="#modalEditFotoRumah">
                            <span>
                                <i class="bx bx-home-alt me-2"></i>
                                Edit Foto Rumah
                            </span>
                            <i class="bx bx-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
            @endif
            <!--/ Profile Actions -->


        </div>
    </div>
    <!--/ User Profile Content -->
</div>

{{-- Modal Edit Data User --}}
<div class="modal fade" id="modalEditDataUser" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <form class="modal-content" method="POST" action="{{ route('users.updateProfile', $user->id ?? 0) }}">
            @csrf
            @method('PUT') {{-- sesuaikan dengan route kamu --}}

            <div class="modal-header">
                <h5 class="modal-title">Edit Data Profil</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
            </div>

            <div class="modal-body">
                <div class="mb-3">
                    <label class="form-label">Nama Lengkap</label>
                    <input type="text" name="name" class="form-control" value="{{ old('name', $user->name) }}" required>
                </div>

                <div class="mb-3">
                    <label class="form-label">Username</label>
                    <input type="text" name="username" class="form-control"
                        value="{{ old('username', $user->username) }}">
                </div>

                <div class="mb-3">
                    <label class="form-label">No. HP</label>
                    <input type="text" name="phone_number" class="form-control"
                        value="{{ old('phone_number', $user->phone_number) }}">
                </div>

                <div class="mb-3">
                    <label class="form-label">Perumahan</label>
                    <input type="text" name="perumahan" class="form-control"
                        value="{{ old('perumahan', $user->perumahan) }}">
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Blok Rumah</label>
                        <input type="text" name="blok_rumah" class="form-control"
                            value="{{ old('blok_rumah', $user->blok_rumah) }}">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">No. Rumah</label>
                        <input type="text" name="no_rumah" class="form-control"
                            value="{{ old('no_rumah', $user->no_rumah) }}">
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
                    Batal
                </button>
                <button type="submit" class="btn btn-primary">
                    Simpan Perubahan
                </button>
            </div>
        </form>
    </div>
</div>

{{-- Modal Edit Foto Profil --}}
<div class="modal fade" id="modalEditFotoProfil" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <form class="modal-content" method="POST" action="{{ route('users.updatePhotoProfile', $user->id ?? 0) }}"
            enctype="multipart/form-data">
            @csrf
            @method('PUT')

            <div class="modal-header">
                <h5 class="modal-title">Edit Foto Profil</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
            </div>

            <div class="modal-body">
                <div class="text-center mb-3">
                    <img src="{{ $user->foto_profile_url }}" alt="Foto Profil" class="rounded-circle mb-2"
                        style="width:100px;height:100px;object-fit:cover;">
                    <p class="text-muted mb-0 small">Foto sekarang</p>
                </div>

                <div class="mb-3">
                    <label class="form-label">Pilih Foto Profil Baru</label>
                    <input type="file" name="foto_profile" class="form-control" accept="image/*">
                    <small class="text-muted">Format: JPG/PNG. Maks 2MB (sesuaikan di validation).</small>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
                    Batal
                </button>
                <button type="submit" class="btn btn-primary">
                    Simpan Foto
                </button>
            </div>
        </form>
    </div>
</div>

{{-- Modal Edit Foto Rumah --}}
<div class="modal fade" id="modalEditFotoRumah" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <form class="modal-content" method="POST" action="{{ route('users.updatePhotoHouse', $user->id ?? 0) }}"
            enctype="multipart/form-data">
            @csrf
            @method('PUT')

            <div class="modal-header">
                <h5 class="modal-title">Edit Foto Rumah</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
            </div>

            <div class="modal-body">
                <div class="text-center mb-3">
                    <img src="{{ $user->foto_rumah_url }}" alt="Foto Rumah" class="img-fluid rounded mb-2">
                    <p class="text-muted mb-0 small">Foto rumah sekarang</p>
                </div>

                <div class="mb-3">
                    <label class="form-label">Pilih Foto Rumah Baru</label>
                    <input type="file" name="foto_rumah" class="form-control" accept="image/*">
                    <small class="text-muted">Format: JPG/PNG. Maks 2MB (sesuaikan di validation).</small>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
                    Batal
                </button>
                <button type="submit" class="btn btn-primary">
                    Simpan Foto
                </button>
            </div>
        </form>
    </div>
</div>
@endsection

@push('scripts')





@endpush