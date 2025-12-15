@extends('layouts.register')

@section('register-content')
<div class="authentication-wrapper authentication-cover">
    {{-- Logo --}}
    <a href="{{ url('/') }}" class="app-brand auth-cover-brand gap-2">
        <span class="app-brand-logo demo">
            <img src="{{ asset('be_view/assets/img/logopbrt-circle.png') }}" alt="PBRT Logo" style="height: 60px;">
        </span>
        <span class="app-brand-text demo text-heading fw-bold">
            RT 17 KASAMBA
        </span>
    </a>
    {{-- /Logo --}}

    <div class="authentication-inner row m-0">
        {{-- Left Text --}}
        <div class="d-none d-lg-flex col-lg-4 align-items-center justify-content-start p-5 pe-5">
            <div class="w-px-500">
                <img src="{{ asset('be_view/assets/img/logopbrt.png') }}" class="img-fluid" alt="RT 17 Kasamba"
                    width="550" />
            </div>
        </div>
        {{-- /Left Text --}}

        {{-- Multi Steps Registration --}}
        <div class="d-flex col-lg-8 align-items-center justify-content-center authentication-bg p-5">
            <div class="w-px-700">

                {{-- Tampilkan error validation global --}}
                @if ($errors->any())
                <div class="alert alert-danger mb-4">
                    <div class="fw-semibold mb-2">Ada data yang belum benar:</div>
                    <ul class="mb-0">
                        @foreach ($errors->all() as $err)
                        <li>{{ $err }}</li>
                        @endforeach
                    </ul>
                </div>
                @endif

                <div id="multiStepsValidation" class="bs-stepper border-none shadow-none mt-5">
                    <div class="bs-stepper-header border-none pt-12 px-0">
                        <div class="step" data-target="#accountDetailsValidation">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle"><i class="bx bx-home"></i></span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">Akun</span>
                                    <span class="bs-stepper-subtitle">Detail Akun</span>
                                </span>
                            </button>
                        </div>

                        <div class="line"><i class="bx bx-chevron-right"></i></div>

                        <div class="step" data-target="#personalInfoValidation">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle"><i class="bx bx-user"></i></span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">Personal Detail</span>
                                    <span class="bs-stepper-subtitle">Informasi Personal</span>
                                </span>
                            </button>
                        </div>

                        <div class="line"><i class="bx bx-chevron-right"></i></div>

                        <div class="step" data-target="#infodetailValidation">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle"><i class="bx bx-detail"></i></span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">Info Lainnya</span>
                                    <span class="bs-stepper-subtitle">Upload Foto</span>
                                </span>
                            </button>
                        </div>
                    </div>

                    <div class="bs-stepper-content px-0">
                        <form id="multiStepsForm" action="{{ route('register') }}" method="POST"
                            enctype="multipart/form-data">
                            @csrf

                            {{-- jika kamu simpan hasil upload dropzone dalam input hidden --}}
                            <input type="hidden" name="foto_rumah" id="foto_rumah" value="{{ old('foto_rumah') }}">
                            <input type="hidden" name="foto_profile" id="foto_profile"
                                value="{{ old('foto_profile') }}">

                            {{-- Step 1: Account --}}
                            <div id="accountDetailsValidation" class="content">
                                <div class="content-header mb-6">
                                    <h4 class="mb-0">Account Information</h4>
                                    <p class="mb-0">Masukkan detail akun</p>
                                </div>

                                <div class="row g-6">
                                    <div class="col-sm-6">
                                        <label class="form-label" for="username">Username</label>
                                        <input type="text" name="username" id="username"
                                            class="form-control @error('username') is-invalid @enderror"
                                            placeholder="Laksamana Chengho" value="{{ old('username') }}"
                                            autocomplete="username">
                                        @error('username') <div class="invalid-feedback">{{ $message }}</div> @enderror
                                    </div>

                                    <div class="col-sm-6">
                                        <label class="form-label" for="email">Email</label>
                                        <input type="email" name="email" id="email"
                                            class="form-control @error('email') is-invalid @enderror"
                                            placeholder="nama@email.com" value="{{ old('email') }}"
                                            autocomplete="email">
                                        @error('email') <div class="invalid-feedback">{{ $message }}</div> @enderror
                                    </div>

                                    <div class="col-sm-6 form-password-toggle">
                                        <label class="form-label" for="password">Password</label>
                                        <div class="input-group input-group-merge">
                                            <input type="password" id="password" name="password"
                                                class="form-control @error('password') is-invalid @enderror"
                                                placeholder="••••••••••••" autocomplete="new-password">
                                            <span class="input-group-text cursor-pointer">
                                                <i class="bx bx-hide"></i>
                                            </span>
                                            @error('password') <div class="invalid-feedback d-block">{{ $message }}
                                            </div> @enderror
                                        </div>
                                    </div>

                                    <div class="col-sm-6 form-password-toggle">
                                        <label class="form-label" for="password_confirmation">Confirm Password</label>
                                        <div class="input-group input-group-merge">
                                            <input type="password" id="password_confirmation"
                                                name="password_confirmation" class="form-control"
                                                placeholder="••••••••••••" autocomplete="new-password">
                                            <span class="input-group-text cursor-pointer">
                                                <i class="bx bx-hide"></i>
                                            </span>
                                        </div>
                                    </div>

                                    <div class="col-12 d-flex justify-content-between">
                                        <button class="btn btn-label-secondary btn-prev" type="button" disabled>
                                            <i class="bx bx-left-arrow-alt bx-sm ms-sm-n2 me-sm-2"></i>
                                            <span class="align-middle d-sm-inline-block d-none">Previous</span>
                                        </button>
                                        <button type="button" class="btn btn-primary btn-next">
                                            <span class="align-middle d-sm-inline-block d-none me-sm-2 me-0">Next</span>
                                            <i class="bx bx-right-arrow-alt bx-sm me-sm-n2"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {{-- Step 2: Personal --}}
                            <div id="personalInfoValidation" class="content">
                                <div class="content-header mb-6">
                                    <h4 class="mb-0">Personal Information</h4>
                                    <p class="mb-0">Masukkan informasi personal</p>
                                </div>

                                <div class="row g-6">
                                    <div class="col-sm-6">
                                        <label class="form-label" for="name">Nama Lengkap</label>
                                        <input type="text" id="name" name="name"
                                            class="form-control @error('name') is-invalid @enderror"
                                            placeholder="Nama Lengkap" value="{{ old('name') }}" autocomplete="name">
                                        @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
                                    </div>

                                    <div class="col-sm-6">
                                        <label class="form-label" for="phone_number">Mobile</label>
                                        <div class="input-group">
                                            <span class="input-group-text">IND (+62)</span>
                                            <input type="text" id="phone_number" name="phone_number"
                                                class="form-control @error('phone_number') is-invalid @enderror"
                                                placeholder="82246668262" value="{{ old('phone_number') }}"
                                                inputmode="numeric" autocomplete="tel">
                                        </div>
                                        @error('phone_number') <div class="invalid-feedback d-block">{{ $message }}
                                        </div> @enderror
                                    </div>

                                    <div class="col-sm-12">
                                        <label class="form-label" for="perumahan">Pilih Perumahan</label>
                                        <select id="perumahan"
                                            class="select2 form-select @error('perumahan') is-invalid @enderror"
                                            name="perumahan" data-allow-clear="true">
                                            <option value="">Select</option>
                                            <option value="Mutiara Selatan"
                                                @selected(old('perumahan')==='Mutiara Selatan' )>Mutiara Selatan
                                            </option>
                                            <option value="Grand Mutiara" @selected(old('perumahan')==='Grand Mutiara'
                                                )>Grand Mutiara</option>
                                        </select>
                                        @error('perumahan') <div class="invalid-feedback d-block">{{ $message }}</div>
                                        @enderror
                                    </div>

                                    <div class="col-sm-6">
                                        <label class="form-label" for="blok_rumah">Pilih Blok Rumah</label>
                                        <select id="blok_rumah"
                                            class="select2 form-select @error('blok_rumah') is-invalid @enderror"
                                            name="blok_rumah" data-allow-clear="true">
                                            <option value="">Select</option>
                                            @foreach (range('A','R') as $blk)
                                            <option value="{{ $blk }}" @selected(old('blok_rumah')===$blk)>Blok
                                                {{ $blk }}
                                            </option>
                                            @endforeach
                                        </select>
                                        @error('blok_rumah') <div class="invalid-feedback d-block">{{ $message }}</div>
                                        @enderror
                                    </div>

                                    <div class="col-sm-6">
                                        <label class="form-label" for="no_rumah">Nomor Rumah</label>
                                        <input type="text" name="no_rumah" id="no_rumah"
                                            class="form-control @error('no_rumah') is-invalid @enderror"
                                            placeholder="Nomor Rumah" value="{{ old('no_rumah') }}">
                                        @error('no_rumah') <div class="invalid-feedback">{{ $message }}</div> @enderror
                                    </div>

                                    <div class="col-12 d-flex justify-content-between">
                                        <button type="button" class="btn btn-label-secondary btn-prev">
                                            <i class="bx bx-left-arrow-alt bx-sm ms-sm-n2 me-sm-2"></i>
                                            <span class="align-middle d-sm-inline-block d-none">Previous</span>
                                        </button>
                                        <button type="button" class="btn btn-primary btn-next">
                                            <span class="align-middle d-sm-inline-block d-none me-sm-2 me-0">Next</span>
                                            <i class="bx bx-right-arrow-alt bx-sm me-sm-n2"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {{-- Step 3: Upload --}}
                            <div id="infodetailValidation" class="content">
                                <div class="content-header mb-6">
                                    <h4 class="mb-0">Informasi Tambahan</h4>
                                    <p class="mb-0">Upload foto rumah dan foto profil</p>
                                </div>

                                <div class="row gap-md-0 gap-4 mb-12">
                                    <div class="col-sm-6">
                                        <div class="card mb-6">
                                            <h5 class="card-header">Upload Foto Rumah</h5>
                                            <div class="card-body">
                                                <div id="dropzone-fotorumah" class="dropzone"></div>
                                                @error('foto_rumah') <div class="text-danger mt-2">{{ $message }}</div>
                                                @enderror
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-sm-6">
                                        <div class="card mb-6">
                                            <h5 class="card-header">Upload Foto Profile</h5>
                                            <div class="card-body">
                                                <div id="dropzone-fotoprofile" class="dropzone"></div>
                                                @error('foto_profile') <div class="text-danger mt-2">{{ $message }}
                                                </div> @enderror
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-12 d-flex justify-content-between">
                                    <button class="btn btn-label-secondary btn-prev" type="button">
                                        <i class="bx bx-left-arrow-alt bx-sm ms-sm-n2 me-sm-2"></i>
                                        <span class="align-middle d-sm-inline-block d-none">Previous</span>
                                    </button>
                                    <button type="submit" class="btn btn-success btn-submit">Submit</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div>
        {{-- / Multi Steps Registration --}}
    </div>
</div>
@endsection

@push('scripts')
@vite('resources/js/register.js')
@endpush