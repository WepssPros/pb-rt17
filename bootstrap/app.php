<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Spatie\Permission\Middlewares\RoleMiddleware;
use Spatie\Permission\Middlewares\PermissionMiddleware;
use Spatie\Permission\Middlewares\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        api: __DIR__ . '/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Daftarkan alias middleware Spatie
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Tangani akses terlarang (403) secara global
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if ($e->getStatusCode() === 403) {
                // Jika dari AJAX/API, return JSON
                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Akses ditolak.'], 403);
                }
                // Jika web biasa, redirect back dengan Toast (session error)
                return redirect()->back()->with('error', $e->getMessage() ?: 'Akses ditolak. Anda tidak memiliki izin untuk halaman ini.');
            }
        });

        // Tangani AuthorizationException (Laravel Native)
        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Akses ditolak.'], 403);
            }
            return redirect()->back()->with('error', 'Akses ditolak. Anda tidak memiliki izin yang diperlukan.');
        });

        // Tangani UnauthorizedException (Spatie Permission)
        $exceptions->render(function (\Spatie\Permission\Exceptions\UnauthorizedException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Akses ditolak.'], 403);
            }
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses (role/permission) yang diperlukan.');
        });
    })
    ->create();
