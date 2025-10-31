@extends('layouts.register')

@section('register-content')
<style>


</style>
<div class="authentication-wrapper authentication-cover">
    <!-- Logo -->
    <a href="index.html" class="app-brand auth-cover-brand gap-2">
        <span class="app-brand-logo demo">
            <img src="{{ asset('../../be_view/assets/img/logopbrt-circle.png') }}" alt="PBRT Logo"
                style="height: 60px;">
        </span>
        <span class="app-brand-text demo text-heading fw-bold">
            RT 17 KASAMBA
        </span>
    </a>
    <!-- /Logo -->
    <div class="authentication-inner row m-0">
        <!-- Left Text -->
        <div class="d-none d-lg-flex col-lg-4 align-items-center justify-content-start p-5 pe-5">
            <div class="w-px-500">
                <img src="../../be_view/assets/img/logopbrt.png" class="img-fluid" alt="multi-steps" width="550"
                    data-app-dark-img="logopbrt.png" data-app-light-img="logopbrt.png" />
            </div>
        </div>
        <!-- /Left Text -->

        <!--  Multi Steps Registration -->
        <div class="d-flex col-lg-8 align-items-center justify-content-center authentication-bg p-5">
            <div class="w-px-700">
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
                        <div class="line">
                            <i class="bx bx-chevron-right"></i>
                        </div>
                        <div class="step" data-target="#personalInfoValidation">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle"><i class="bx bx-user"></i></span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">Personal Detail</span>
                                    <span class="bs-stepper-subtitle">Informasi Personal</span>
                                </span>
                            </button>
                        </div>

                        <div class="line">
                            <i class="bx bx-chevron-right"></i>
                        </div>
                        <div class="step" data-target="#infodetailValidation">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle"><i class="bx bx-detail"></i></span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">Info Lainnya</span>
                                    <span class="bs-stepper-subtitle">Info Detail Lainnya</span>
                                </span>
                            </button>
                        </div>
                    </div>
                    <div class="bs-stepper-content px-0">
                        <form id="multiStepsForm" action="{{ route('register') }}" method="POST"
                            enctype="multipart/form-data">
                            @csrf
                            <input type="hidden" name="foto_rumah" id="foto_rumah">
                            <input type="hidden" name="foto_profile" id="foto_profile">
                            <!-- Account Details -->

                            <div id="accountDetailsValidation" class="content">
                                <div class="content-header mb-6">
                                    <h4 class="mb-0">Account Information</h4>
                                    <p class="mb-0">Enter Your Account Details</p>
                                </div>
                                <div class="row g-6">
                                    <div class="col-sm-6">
                                        <label class="form-label" for="username">Username Anda</label>
                                        <input type="text" name="username" id="username" class="form-control"
                                            placeholder="Laksamana Chengho" />
                                    </div>
                                    <div class="col-sm-6">
                                        <label class="form-label" for="email">Email Anda</label>
                                        <input type="email" name="email" id="email" class="form-control"
                                            placeholder="laksamanaChengho@email.com" aria-label="laksamanaChengho" />
                                    </div>
                                    <div class="col-sm-6 form-password-toggle">
                                        <label class="form-label" for="password">Password</label>
                                        <div class="input-group input-group-merge">
                                            <input type="password" id="password" name="password" class="form-control"
                                                placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                                                aria-describedby="password2" />
                                            <span class="input-group-text cursor-pointer" id="password2"><i
                                                    class="bx bx-hide"></i></span>
                                        </div>
                                    </div>
                                    <div class="col-sm-6 form-password-toggle">
                                        <label class="form-label" for="password_confirmation">Confirm
                                            Password</label>
                                        <div class="input-group input-group-merge">
                                            <input type="password" id="password_confirmation"
                                                name="password_confirmation" class="form-control"
                                                placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                                                aria-describedby="password_confirmation2" />
                                            <span class="input-group-text cursor-pointer" id="password_confirmation2"><i
                                                    class="bx bx-hide"></i></span>
                                        </div>
                                    </div>


                                    <div class="col-12 d-flex justify-content-between">
                                        <button class="btn btn-label-secondary btn-prev" disabled>
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
                            <!-- Personal Info -->
                            <div id="personalInfoValidation" class="content">
                                <div class="content-header mb-6">
                                    <h4 class="mb-0">Personal Information</h4>
                                    <p class="mb-0">Enter Your Personal Information</p>
                                </div>
                                <div class="row g-6">
                                    <div class="col-sm-6">
                                        <label class="form-label" for="name">Nama Anda</label>
                                        <input type="text" id="name" name="name" class="form-control"
                                            placeholder="Nama Lengkap" />
                                    </div>

                                    <div class="col-sm-6">
                                        <label class="form-label" for="phone_number">Mobile</label>
                                        <div class="input-group">
                                            <span class="input-group-text">IND (+62)</span>
                                            <input type="text" id="phone_number" name="phone_number"
                                                class="form-control multi-steps-mobile" placeholder="82246668262" />
                                        </div>
                                    </div>
                                    <div class="col-sm-12">
                                        <label class="form-label" for="Perumahan">Pilih Perumahan</label>
                                        <select id="Perumahan" class="select2 form-select" name="perumahan"
                                            data-allow-clear="true">
                                            <option value="">Select</option>
                                            <option value="Mutiara Selatan">Mutiara Selatan</option>
                                            <option value="Grand Mutiara">Grand Mutiara</option>


                                        </select>
                                    </div>
                                    <div class="col-sm-6">
                                        <label class="form-label" for="blok_rumah">Pilih Blok Rumah</label>
                                        <select id="blok_rumah" class="select2 form-select" name="blok_rumah"
                                            data-allow-clear="true">
                                            <option value="">Select</option>
                                            <option value="A">Blok A</option>
                                            <option value="B">Blok B</option>
                                            <option value="C">Blok C</option>
                                            <option value="D">Blok D</option>
                                            <option value="E">Blok E</option>
                                            <option value="F">Blok F</option>
                                            <option value="G">Blok G</option>
                                            <option value="H">Blok H</option>
                                            <option value="I">Blok I</option>
                                            <option value="J">Blok J</option>
                                            <option value="K">Blok K</option>
                                            <option value="L">Blok L</option>
                                            <option value="M">Blok M</option>
                                            <option value="N">Blok N</option>
                                            <option value="O">Blok O</option>
                                            <option value="P">Blok P</option>
                                            <option value="Q">Blok Q</option>
                                            <option value="R">Blok R</option>

                                        </select>
                                    </div>
                                    <div class="col-sm-6">
                                        <label class="form-label" for="no_rumah">Nomor Rumah</label>
                                        <input type="text" name="no_rumah" id="no_rumah" class="form-control"
                                            placeholder="Nomor Rumah" />
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
                            <!--  Links -->
                            <div id="infodetailValidation" class="content">
                                <div class="content-header mb-6">
                                    <h4 class="mb-0">Informasi Tambahan</h4>
                                    <p class="mb-0">Upload Foto Rumah Dan Profile</p>
                                </div>

                                <div class="row gap-md-0 gap-4 mb-12">
                                    <div class="col-sm-6">
                                        <div class="card mb-6">
                                            <h5 class="card-header">Upload Foto Rumah</h5>
                                            <div class="card-body">
                                                <div id="dropzone-fotorumah" class="dropzone"></div>

                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-sm-6">
                                        <div class="card mb-6">
                                            <h5 class="card-header">Upload Foto Profile</h5>
                                            <div class="card-body">
                                                <div id="dropzone-fotoprofile" class="dropzone"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-12 d-flex justify-content-between">
                                    <button class="btn btn-label-secondary btn-prev" type="button">
                                        <i class="bx bx-left-arrow-alt bx-sm ms-sm-n2 me-sm-2"></i>
                                        <span class="align-middle d-sm-inline-block d-none">Previous</span>
                                    </button>
                                    <button type="submit" class="btn btn-success  btn-submit">Submit</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <!-- / Multi Steps Registration -->
    </div>
</div>
@endsection

@push('scripts')
{{-- <script src="../../be_view/assets/js/pages-auth-multisteps.js"></script>  --}}
@vite('resources/js/register.js')

@endpush