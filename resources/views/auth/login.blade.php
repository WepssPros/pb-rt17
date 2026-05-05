@extends('layouts.auth')

@section('auth-content')
@php
    $bootstrap = [
        'csrfToken' => csrf_token(),
        'loginUrl' => route('login'),
        'registerUrl' => Route::has('register') ? route('register') : null,
        'status' => session('status'),
        'logoMark' => asset('be_view/assets/img/logopbrt-circle.png'),
        'old' => [
            'email' => old('email'),
            'remember' => old('remember') ? true : false,
        ],
        'errors' => [
            'email' => $errors->first('email'),
            'password' => $errors->first('password'),
        ],
    ];
@endphp

<div id="login-root"></div>
<script>
    window.__LOGIN_BOOTSTRAP__ = {!! \Illuminate\Support\Js::from($bootstrap) !!};
</script>
@endsection
