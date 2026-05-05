<!doctype html>
<html lang="id" class="theme dark">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Login User Kas Monitoring RT 17 Kasamba</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.cdnfonts.com/css/satoshi" rel="stylesheet">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/auth/login.jsx'])
</head>

<body class="min-h-screen bg-[#050816] text-white antialiased">
    @yield('auth-content')
</body>

</html>
