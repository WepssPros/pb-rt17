@extends('layouts.auth')

@section('auth-content')
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
        <!-- /Left Text -->
        <div class="d-none d-lg-flex col-lg-7 col-xl-8 align-items-center p-5">
            <div class="w-100 d-flex justify-content-center">
                <img src="../../be_view/assets/img/logopbrt.png" class="img-fluid" alt="Login image" width="700"
                    data-app-dark-img="../../be_view/assets/img/logopbrt.png" data-app-light-img="logopbrt.png" />
            </div>
        </div>
        <!-- /Left Text -->

        <!-- Login -->
        <div class="d-flex col-12 col-lg-5 col-xl-4 align-items-center authentication-bg p-sm-12 p-6">
            <div class="w-px-400 mx-auto mt-12 pt-5">
                <h4 class="mb-1">Selamat Datang Di Kas Monitoring PBRT 17! 👋</h4>
                <p class="mb-6">Silahkan Login Terlebih Dahulu</p>

                <form id="formAuthentication" class="mb-6" method="POST" action="{{ route('login') }}">
                    @csrf
                    <div class="mb-6">
                        <label for="email" class="form-label">Email </label>
                        <input type="text" class="form-control" id="email" name="email" placeholder="Enter your email "
                            autofocus />
                    </div>
                    <div class="mb-6 form-password-toggle">
                        <label class="form-label" for="password">Password</label>
                        <div class="input-group input-group-merge">
                            <input type="password" id="password" class="form-control" name="password"
                                placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                                aria-describedby="password" />
                            <span class="input-group-text cursor-pointer"><i class="bx bx-hide"></i></span>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary d-grid w-100">Sign in</button>
                </form>

                <p class="text-center">
                    <span>Tidak Punya Akun ?</span>
                    <a href="{{route('register')}}">
                        <span>Daftar Disini</span>
                    </a>
                </p>

                <div class="divider my-6">
                    <div class="divider-text">or</div>
                </div>

                <div class="d-flex justify-content-center mt-4">
                    <a href="#" class="btn btn-google d-flex align-items-center px-4 py-2">
                        <i class="bx bxl-google me-2"></i>
                        <span>Google Login</span>
                    </a>
                </div>
            </div>
        </div>
        <!-- /Login -->
    </div>
</div>
@endsection