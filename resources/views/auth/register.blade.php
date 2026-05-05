@extends('layouts.register')

@section('register-content')
@php
    $bootstrap = [
        'csrfToken' => csrf_token(),
        'registerUrl' => route('register'),
        'logoMark' => asset('be_view/assets/img/logopbrt-circle.png'),
        'housePlaceholder' => asset('be_view/assets/img/avatars/1.png'),
        'profilePlaceholder' => asset('be_view/assets/img/avatars/1.png'),
        'old' => [
            'username' => old('username'),
            'email' => old('email'),
            'name' => old('name'),
            'phone_number' => old('phone_number'),
            'perumahan' => old('perumahan'),
            'blok_rumah' => old('blok_rumah'),
            'no_rumah' => old('no_rumah'),
        ],
        'errors' => [
            'username' => $errors->first('username'),
            'email' => $errors->first('email'),
            'password' => $errors->first('password'),
            'password_confirmation' => $errors->first('password_confirmation'),
            'name' => $errors->first('name'),
            'phone_number' => $errors->first('phone_number'),
            'perumahan' => $errors->first('perumahan'),
            'blok_rumah' => $errors->first('blok_rumah'),
            'no_rumah' => $errors->first('no_rumah'),
            'foto_rumah' => $errors->first('foto_rumah'),
            'foto_profile' => $errors->first('foto_profile'),
        ],
        'errorSummary' => $errors->all(),
        'perumahanOptions' => [
            ['value' => 'Mutiara Selatan', 'label' => 'Mutiara Selatan'],
            ['value' => 'Grand Mutiara', 'label' => 'Grand Mutiara'],
        ],
        'blokOptions' => collect(range('A', 'R'))->map(fn ($letter) => [
            'value' => $letter,
            'label' => 'Blok ' . $letter,
        ])->values(),
    ];
@endphp

<div id="register-root"></div>
<script>
    window.__REGISTER_BOOTSTRAP__ = {!! \Illuminate\Support\Js::from($bootstrap) !!};
</script>
@endsection
