<?php

use App\Domain\Auth\Http\Controllers\AuthController;
use App\Domain\Auth\Http\Controllers\GoogleAuthController;
use App\Domain\Courier\Http\Controllers\ProfileCourierController;
use App\Domain\Laundry\Http\Controllers\LaundryCourierController;
use App\Domain\Laundry\Http\Controllers\LaundryStaffApplicationController;
use App\Domain\Laundry\Http\Controllers\LaundryStaffController;
use App\Domain\Laundry\Http\Controllers\LaundryStaffOpeningController;
use App\Domain\Laundry\Http\Controllers\LaundryVerificationController;
use App\Domain\Laundry\Http\Controllers\ProfileLaundryController;
use App\Domain\Laundry\Http\Controllers\StaffApplicationController;
use App\Domain\Laundry\Http\Controllers\StaffOpeningController;
use App\Domain\Admin\Http\Controllers\AdminVerificationController;
use App\Domain\Order\Http\Controllers\OrderController;
use App\Domain\Pricing\Http\Controllers\ServiceController;
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

    // Google OAuth — untuk semua 5 web (customer, manager, staff, courier, admin)
    Route::get('/google/redirect', [GoogleAuthController::class, 'redirect']);
    Route::get('/google/callback', [GoogleAuthController::class, 'callback']);
    Route::post('/google', [GoogleAuthController::class, 'handleIdToken']);

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

// ── Public catalog, laundry discovery & staff openings ──
Route::prefix('v1')->group(function () {
    Route::get('/staff-openings', [StaffOpeningController::class, 'index']);
    Route::get('/staff-openings/{id}', [StaffOpeningController::class, 'show']);
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{id}', [ServiceController::class, 'show']);
    Route::get('/laundries', [\App\Domain\Laundry\Http\Controllers\LaundryDiscoveryController::class, 'index']);
    Route::get('/laundries/{id}', [\App\Domain\Laundry\Http\Controllers\LaundryDiscoveryController::class, 'show']);
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

    // Manager — kelola staff langsung (PRD §11) + kurir staff
    Route::get('/laundry/staff', [LaundryStaffController::class, 'index']);
    Route::post('/laundry/staff', [LaundryStaffController::class, 'store']);
    Route::delete('/laundry/staff/{id}', [LaundryStaffController::class, 'destroy']);
    Route::post('/laundry/staff/{id}/activate', [LaundryStaffController::class, 'activate']);

    Route::post('/laundry/staff/{staffId}/courier', [LaundryCourierController::class, 'activateStaffCourier']);
    Route::get('/laundry/couriers', [LaundryCourierController::class, 'index']);
    Route::delete('/laundry/couriers/{id}', [LaundryCourierController::class, 'deactivate']);

    // Manager verification untuk staff KTP (PRD §10 — diverifikasi manager, bukan admin)
    Route::get('/laundry/verification-documents', [LaundryVerificationController::class, 'index']);
    Route::get('/laundry/verification-documents/{id}/file', [LaundryVerificationController::class, 'file']);
    Route::post('/laundry/verification-documents/{id}/review', [LaundryVerificationController::class, 'review']);

    // Catalog & Pricing — Manager only (Schema §4.8-4.9, Design §16)
    Route::post('/laundry/services', [ServiceController::class, 'store']);
    Route::patch('/laundry/services/{id}', [ServiceController::class, 'update']);
    Route::delete('/laundry/services/{id}', [ServiceController::class, 'destroy']);
    Route::post('/laundry/services/{id}/prices', [ServiceController::class, 'updatePrice']);
    Route::get('/laundry/services/{id}/prices', [ServiceController::class, 'priceHistory']);

    // Addresses — customer only (Schema §4.10)
    Route::get('/addresses', [\App\Domain\Customer\Http\Controllers\AddressController::class, 'index']);
    Route::post('/addresses', [\App\Domain\Customer\Http\Controllers\AddressController::class, 'store']);
    Route::patch('/addresses/{id}', [\App\Domain\Customer\Http\Controllers\AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [\App\Domain\Customer\Http\Controllers\AddressController::class, 'destroy']);
    Route::post('/addresses/{id}/default', [\App\Domain\Customer\Http\Controllers\AddressController::class, 'setDefault']);

    // Orders — PRD §14, Architecture §8
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/confirm', [OrderController::class, 'confirm']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    // Weighing & Evidence — PRD §16, Architecture §10
    Route::get('/orders/{id}/weighing', [\App\Domain\Weighing\Http\Controllers\WeighingController::class, 'show']);
    Route::post('/orders/{id}/weighing/record', [\App\Domain\Weighing\Http\Controllers\WeighingController::class, 'record']);
    Route::post('/orders/{id}/weighing/confirm', [\App\Domain\Weighing\Http\Controllers\WeighingController::class, 'confirmReview']);
    Route::post('/orders/{id}/weighing/invalidate', [\App\Domain\Weighing\Http\Controllers\WeighingController::class, 'invalidate']);

    // Courier Jobs — PRD §17, Architecture §8
    Route::get('/courier/jobs', [\App\Domain\Courier\Http\Controllers\CourierJobController::class, 'index']);
    Route::get('/courier/jobs/active', [\App\Domain\Courier\Http\Controllers\CourierJobController::class, 'active']);
    Route::post('/courier/jobs/{id}/accept', [\App\Domain\Courier\Http\Controllers\CourierJobController::class, 'accept']);
    Route::post('/courier/jobs/{id}/status', [\App\Domain\Courier\Http\Controllers\CourierJobController::class, 'updateStatus']);

    // Payments & Invoices — PRD §18, Architecture §8
    Route::post('/orders/{id}/payments/charge', [\App\Domain\Payment\Http\Controllers\PaymentController::class, 'charge']);
    Route::post('/payments/{id}/simulate', [\App\Domain\Payment\Http\Controllers\PaymentController::class, 'simulate']);
    Route::get('/orders/{id}/invoice', [\App\Domain\Invoice\Http\Controllers\InvoiceController::class, 'show']);

    // Settlements & Earnings — PRD §19, Architecture §8
    Route::get('/laundry/settlements', [\App\Domain\Settlement\Http\Controllers\SettlementController::class, 'laundrySettlements']);
    Route::post('/laundry/settlements/request', [\App\Domain\Settlement\Http\Controllers\SettlementController::class, 'requestLaundrySettlement']);
    Route::get('/courier/earnings', [\App\Domain\Settlement\Http\Controllers\SettlementController::class, 'courierEarnings']);
    Route::post('/courier/settlements/withdraw', [\App\Domain\Settlement\Http\Controllers\SettlementController::class, 'withdrawCourierEarnings']);

    // Complaints & Dispute — PRD §21, Architecture §8
    Route::post('/orders/{id}/complaints', [\App\Domain\Complaint\Http\Controllers\ComplaintController::class, 'store']);
    Route::get('/complaints', [\App\Domain\Complaint\Http\Controllers\ComplaintController::class, 'index']);

    // Reviews & Ratings — PRD §22, Architecture §8
    Route::post('/orders/{id}/reviews', [\App\Domain\Review\Http\Controllers\ReviewController::class, 'store']);
    Route::get('/laundries/{id}/reviews', [\App\Domain\Review\Http\Controllers\ReviewController::class, 'laundryReviews']);

    // Notifications — PRD §23, Architecture §8
    Route::get('/notifications', [\App\Domain\Notification\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [\App\Domain\Notification\Http\Controllers\NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [\App\Domain\Notification\Http\Controllers\NotificationController::class, 'markAllRead']);

    // Verification documents — Schema §4.26
    Route::post('/verification-documents', [VerificationDocumentController::class, 'store']);
    Route::get('/verification-documents', [VerificationDocumentController::class, 'index']);
});

Route::post('/v1/payments/webhook', [\App\Domain\Payment\Http\Controllers\PaymentController::class, 'webhook']);

Route::get('/v1/weighing-evidence/{id}/photo', [\App\Domain\Weighing\Http\Controllers\WeighingController::class, 'servePhoto'])
    ->name('weighing.photo');

// ── Admin verification management (PRD §20, Architecture §9.2.1) ──
Route::prefix('v1/admin')->middleware('auth:sanctum')->group(function () {
    Route::get('/verification-documents', [AdminVerificationController::class, 'index']);
    Route::get('/verification-documents/{id}', [AdminVerificationController::class, 'show']);
    Route::get('/verification-documents/{id}/file', [AdminVerificationController::class, 'file']);
    Route::post('/verification-documents/{id}/review', [AdminVerificationController::class, 'review']);

    // Admin Settlements
    Route::get('/settlements', [\App\Domain\Settlement\Http\Controllers\SettlementController::class, 'adminIndex']);
    Route::post('/settlements/{id}/approve', [\App\Domain\Settlement\Http\Controllers\SettlementController::class, 'approveSettlement']);

    // Admin Complaints Arbitration — PRD §21
    Route::get('/complaints', [\App\Domain\Complaint\Http\Controllers\AdminComplaintController::class, 'index']);
    Route::post('/complaints/{id}/resolve', [\App\Domain\Complaint\Http\Controllers\AdminComplaintController::class, 'resolve']);

    // Admin Order Override — Phase 5, PRD §24
    Route::get('/orders', [\App\Domain\Admin\Http\Controllers\AdminOrderController::class, 'index']);
    Route::post('/orders/{id}/override', [\App\Domain\Admin\Http\Controllers\AdminOrderController::class, 'override']);

    // Platform Configs — Super Admin only, Phase 5
    Route::get('/configs', [\App\Domain\Admin\Http\Controllers\AdminSettingController::class, 'index']);
    Route::post('/configs', [\App\Domain\Admin\Http\Controllers\AdminSettingController::class, 'upsert']);

    // Audit Logs — Immutable Trail Viewer, Phase 5
    Route::get('/audit-logs', [\App\Domain\Admin\Http\Controllers\AuditLogController::class, 'index']);
    Route::get('/audit-logs/{id}', [\App\Domain\Admin\Http\Controllers\AuditLogController::class, 'show']);
});

// Public config endpoint
Route::get('/v1/configs/{key}', [\App\Domain\Admin\Http\Controllers\AdminSettingController::class, 'publicConfig']);