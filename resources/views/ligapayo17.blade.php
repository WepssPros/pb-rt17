<!doctype html>
<html lang="id" class="theme">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Liga Payo 17 - PBRT17</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
        (() => {
            try {
                const theme = localStorage.getItem('pbrt-theme') || 'light';
                document.documentElement.classList.toggle('dark', theme === 'dark');
                document.documentElement.dataset.theme = theme;
            } catch (error) {
                document.documentElement.classList.remove('dark');
                document.documentElement.dataset.theme = 'light';
            }
        })();
    </script>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/ligapayo17/main.jsx'])
</head>

<body class="min-h-screen bg-background text-foreground antialiased">
    <div id="ligapayo17-root" data-endpoint="{{ route('ligapayo17.data') }}"></div>
</body>

</html>
