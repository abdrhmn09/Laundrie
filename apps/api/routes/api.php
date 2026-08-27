<?php

use App\Domain\Auth\Http\Controllers\AuthController;
use App\Domain\Courier\Http\Controllers\ProfileCourierController;
use App\Domain\Laundry\Http\Controllers\LaundryStaffApplicationController;
use App\Domain\Laundry\Http\Controllers\LaundryStaffOpeningController;
use App\Domain\Laundry\Http\Controllers\ProfileLaundryController;
use App\Domain\Laundry\Http\Controllers\StaffApplicationController;
use App\Domain\Laundry\Http\Controllers\StaffOpeningController;
use App\Domain\Admin\Http\Controllers\AdminVerificationController;
use App\Domain\Verification\Http\Controllers\VerificationDocumentController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/auth')->group(function () {
    // Public routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->name('verification.verify');

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/profile/avatar', [AuthController::class, 'uploadAvatar']);
        Route::delete('/profile/avatar', [AuthController::class, 'deleteAvatar']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
        Route::get('/sessions', [AuthController::class, 'sessions']);
        Route::delete('/sessions/{id}', [AuthController::class, 'revokeSession']);
        Route::delete('/sessions', [AuthController::class, 'revokeAllSessions']);
    });
});

// ── Public staff openings (tidak perlu auth untuk lihat daftar lowongan) ──
Route::prefix('v1')->group(function () {
    Route::get('/staff-openings', [StaffOpeningController::class, 'index']);
    Route::get('/staff-openings/{id}', [StaffOpeningController::class, 'show']);
});

// ── Profile as Capability Hub (PRD §7, Architecture §9.2.x) ──
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::get('/profile/options', [ProfileLaundryController::class, 'options']);
    Route::post('/profile/laundry', [ProfileLaundryController::class, 'store']);
    Route::get('/profile/laundry', [ProfileLaundryController::class, 'show']);

    Route::post('/profile/courier/freelance', [ProfileCourierController::class, 'storeFreelance']);
    Route::post('/profile/courier/staff', [ProfileCourierController::class, 'storeStaff']);

    // Staff applications (butuh auth)
    Route::post('/staff-openings/{openingId}/apply', [StaffOpeningController::class, 'apply']);

    Route::get('/me/staff-applications', [StaffApplicationController::class, 'index']);
    Route::post('/staff-applications/{id}/withdraw', [StaffApplicationController::class, 'withdraw']);

    // Manager-only laundry openings & applications
    Route::post('/laundry/staff-openings', [LaundryStaffOpeningController::class, 'store']);
    Route::get('/laundry/staff-openings', [LaundryStaffOpeningController::class, 'index']);
    Route::patch('/laundry/staff-openings/{id}', [LaundryStaffOpeningController::class, 'update']);
    Route::post('/laundry/staff-openings/{id}/close', [LaundryStaffOpeningController::class, 'close']);

    Route::get('/laundry/staff-applications', [LaundryStaffApplicationController::class, 'index']);
    Route::post('/laundry/staff-applications/{id}/accept', [LaundryStaffApplicationController::class, 'accept']);
    Route::post('/laundry/staff-applications/{id}/reject', [LaundryStaffApplicationController::class, 'reject']);

    // Verification documents — Schema §4.26
    Route::post('/verification-documents', [VerificationDocumentController::class, 'store']);
    Route::get('/verification-documents', [VerificationDocumentController::class, 'index']);
});

// ── Admin verification management (PRD §20, Architecture §9.2.1) ──
Route::prefix('v1/admin')->middleware('auth:sanctum')->group(function () {
    Route::get('/verification-documents', [AdminVerificationController::class, 'index']);
    Route::get('/verification-documents/{id}', [AdminVerificationController::class, 'show']);
    Route::post('/verification-documents/{id}/review', [AdminVerificationController::class, 'review']);
});