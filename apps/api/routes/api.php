<?php

use App\Domain\Auth\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
        Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
        Route::post('/logout', [AuthController::class, 'logout'])
            ->middleware('auth:sanctum')
            ->name('auth.logout');
        Route::get('/me', [AuthController::class, 'me'])
            ->middleware('auth:sanctum')
            ->name('auth.me');
    });
});