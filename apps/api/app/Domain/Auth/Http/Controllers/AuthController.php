<?php

namespace App\Domain\Auth\Http\Controllers;

use App\Domain\Auth\Actions\RegisterUser;
use App\Domain\Auth\Enums\UserStatus;
use App\Domain\Auth\Http\Requests\ChangePasswordRequest;
use App\Domain\Auth\Http\Requests\ForgotPasswordRequest;
use App\Domain\Auth\Http\Requests\LoginRequest;
use App\Domain\Auth\Http\Requests\RegisterRequest;
use App\Domain\Auth\Http\Requests\ResetPasswordRequest;
use App\Domain\Auth\Http\Requests\UpdateProfileRequest;
use App\Domain\Auth\Resources\SessionResource;
use App\Domain\Auth\Resources\UserResource;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends \App\Http\Controllers\Controller
{
    public function register(RegisterRequest $request, RegisterUser $registerUser): JsonResponse
    {
        $user = $registerUser->execute($request->validated());

        $token = $user->createToken(
            $request->header('User-Agent', 'laundrie-web'),
            $this->abilitiesFor($user->role),
        )->plainTextToken;

        $message = $user->status === UserStatus::PendingVerification->value
            ? 'Pendaftaran berhasil. Akun Anda sedang dalam proses peninjauan & verifikasi oleh Tim Operasional Laundrie.'
            : 'Pendaftaran berhasil. Silakan periksa email Anda untuk verifikasi.';

        return response()->json([
            'message' => $message,
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
            'requires_verification' => $user->status === UserStatus::EmailUnverified->value,
        ], Response::HTTP_CREATED);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $key = 'login:'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            throw ValidationException::withMessages([
                'email' => ['Terlalu banyak percobaan login. Coba lagi dalam '.RateLimiter::availableIn($key).' detik.'],
            ])->status(Response::HTTP_TOO_MANY_REQUESTS);
        }

        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials)) {
            RateLimiter::hit($key, 60);
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ])->status(Response::HTTP_UNAUTHORIZED);
        }

        /** @var User $user */
        $user = Auth::user();

        if ($user->status === UserStatus::Suspended->value) {
            RateLimiter::hit($key, 60);
            throw ValidationException::withMessages([
                'email' => ['Akun Anda ditangguhkan. Silakan hubungi dukungan pelanggan.'],
            ])->status(Response::HTTP_FORBIDDEN);
        }

        RateLimiter::clear($key);

        $user->forceFill(['last_login_at' => now()])->save();

        $token = $user->createToken(
            $request->input('device_name', $request->header('User-Agent', 'laundrie-web')),
            $this->abilitiesFor($user->role),
        )->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
            'requires_verification' => ! $user->isEmailVerified(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    public function verifyEmail(Request $request, int $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Tautan verifikasi tidak valid.'], Response::HTTP_BAD_REQUEST);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email sudah terverifikasi sebelumnya.',
                'user' => new UserResource($user),
            ]);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
            $user->forceFill(['status' => UserStatus::Active->value])->save();
        }

        return response()->json([
            'message' => 'Email berhasil diverifikasi.',
            'user' => new UserResource($user),
        ]);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email sudah terverifikasi.']);
        }

        $key = 'resend-verification:'.$user->id;
        if (RateLimiter::tooManyAttempts($key, 3)) {
            return response()->json([
                'message' => 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.',
            ], Response::HTTP_TOO_MANY_REQUESTS);
        }

        RateLimiter::hit($key, 120);

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Email verifikasi telah dikirim ulang.']);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $key = 'forgot-password:'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 3)) {
            throw ValidationException::withMessages([
                'email' => ['Terlalu banyak permintaan reset password. Silakan coba lagi nanti.'],
            ])->status(Response::HTTP_TOO_MANY_REQUESTS);
        }

        RateLimiter::hit($key, 300);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Tautan reset password telah dikirim ke email Anda.']);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password Anda berhasil diperbarui. Silakan login kembali.']);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->fill($request->validated());
        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => new UserResource($user),
        ]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
        ], [
            'avatar.required' => 'File foto profil wajib diunggah.',
            'avatar.image' => 'File harus berupa gambar.',
            'avatar.mimes' => 'Format gambar harus JPEG, PNG, JPG, GIF, atau WEBP.',
            'avatar.max' => 'Ukuran foto maksimal 5MB.',
        ]);

        /** @var User $user */
        $user = $request->user();

        if ($user->avatar_url && str_contains($user->avatar_url, 'avatars/')) {
            $oldPath = Str::after($user->avatar_url, 'storage/');
            \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->avatar_url = $path;
        $user->save();

        return response()->json([
            'message' => 'Foto profil berhasil diperbarui.',
            'user' => new UserResource($user),
        ]);
    }

    public function deleteAvatar(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->avatar_url && str_contains($user->avatar_url, 'avatars/')) {
            $oldPath = Str::after($user->avatar_url, 'storage/');
            \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
        }

        $user->avatar_url = null;
        $user->save();

        return response()->json([
            'message' => 'Foto profil berhasil dihapus.',
            'user' => new UserResource($user),
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->forceFill([
            'password' => Hash::make($request->input('password')),
        ])->save();

        return response()->json(['message' => 'Password berhasil diubah.']);
    }

    public function sessions(Request $request): JsonResponse
    {
        $tokens = $request->user()->tokens()->orderByDesc('created_at')->get();

        return response()->json([
            'sessions' => SessionResource::collection($tokens),
        ]);
    }

    public function revokeSession(Request $request, int $id): JsonResponse
    {
        $token = $request->user()->tokens()->where('id', $id)->first();

        if (! $token) {
            return response()->json(['message' => 'Sesi tidak ditemukan.'], Response::HTTP_NOT_FOUND);
        }

        $token->delete();

        return response()->json(['message' => 'Sesi berhasil diakhiri.']);
    }

    public function revokeAllSessions(Request $request): JsonResponse
    {
        $currentTokenId = $request->user()->currentAccessToken()->id;
        $request->user()->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json(['message' => 'Semua sesi perangkat lain telah diakhiri.']);
    }

    private function abilitiesFor(string $role): array
    {
        return match ($role) {
            User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN => ['*'],
            User::ROLE_OPERATIONS_ADMIN => ['orders:*', 'partners:*', 'couriers:*', 'disputes:*'],
            User::ROLE_FINANCE_ADMIN => ['payments:*', 'refunds:*', 'settlements:*'],
            User::ROLE_MANAGER => ['branch:*', 'services:*', 'staff:*', 'orders:read', 'orders:update'],
            User::ROLE_STAFF => ['orders:read', 'orders:update', 'weighing:write', 'evidence:write'],
            User::ROLE_COURIER => ['orders:read', 'jobs:read', 'jobs:update'],
            default => ['orders:read', 'orders:write', 'profile:write'],
        };
    }
}