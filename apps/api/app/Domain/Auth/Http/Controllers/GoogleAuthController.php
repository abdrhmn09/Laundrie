<?php

namespace App\Domain\Auth\Http\Controllers;

use App\Domain\Auth\Enums\UserStatus;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse;

class GoogleAuthController extends \App\Http\Controllers\Controller
{
    /**
     * Redirect ke Google OAuth — dipakai oleh frontend via window.location.href
     * Query ?frontend_url=http://127.0.0.1:5173 opsional untuk redirect kembali ke web yang meminta
     */
    public function redirect(Request $request): RedirectResponse
    {
        $frontendUrl = $request->query('frontend_url', config('app.frontend_url', 'http://127.0.0.1:5173'));

        // Simpan frontend_url di state agar bisa dipakai di callback
        return Socialite::driver('google')
            ->stateless()
            ->with(['state' => base64_encode($frontendUrl)])
            ->redirect();
    }

    /**
     * Callback dari Google — buat/cari user, buat token, redirect ke frontend dengan token
     */
    public function callback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect(config('app.frontend_url', 'http://127.0.0.1:5173') . '/login?error=google_failed');
        }

        $user = $this->findOrCreateUser($googleUser);

        $token = $user->createToken(
            'google-oauth',
            $this->abilitiesFor($user->role),
        )->plainTextToken;

        // Ambil frontend_url dari state (jika ada)
        $state = $request->query('state') ?? $request->input('state');
        $frontendUrl = config('app.frontend_url', 'http://127.0.0.1:5173');
        if ($state) {
            $decoded = base64_decode($state, true);
            if ($decoded && filter_var($decoded, FILTER_VALIDATE_URL)) {
                $frontendUrl = $decoded;
            }
        }

        // Redirect ke frontend dengan token sebagai query param (akan ditangkap AuthContext)
        return redirect($frontendUrl . '/auth/google/callback?token=' . urlencode($token));
    }

    /**
     * Alternatif untuk Google Identity Services (One Tap) — frontend kirim id_token
     * POST /api/v1/auth/google { id_token: string, frontend_url?: string }
     */
    public function handleIdToken(Request $request): JsonResponse
    {
        $request->validate([
            'id_token' => ['required', 'string'],
        ]);

        try {
            // Verifikasi id_token via Socialite stateless dengan Google
            // Socialite tidak langsung verifikasi id_token, jadi kita pakai Google's tokeninfo
            // Untuk MVP, kita decode tanpa verifikasi signature via Socialite's userFromToken tidak tersedia untuk id_token,
            // jadi kita verifikasi via Google's oauth2 tokeninfo endpoint atau via firebase/php-jwt + Google certs.
            // Simplifikasi: gunakan Socialite untuk mendapatkan user dari id_token via stateless dengan custom request
            // Jika gagal, fallback ke verifikasi manual via https://oauth2.googleapis.com/tokeninfo

            $idToken = $request->input('id_token');

            // Coba verifikasi via Google tokeninfo
            $response = \Illuminate\Support\Facades\Http::get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $idToken,
            ]);

            if (! $response->successful()) {
                return response()->json(['message' => 'Token Google tidak valid.'], 401);
            }

            $payload = $response->json();

            // Validasi audience (client_id)
            $expectedClientId = config('services.google.client_id');
            if ($expectedClientId && ($payload['aud'] ?? null) !== $expectedClientId) {
                return response()->json(['message' => 'Token Google tidak valid untuk aplikasi ini.'], 401);
            }

            if (empty($payload['email'])) {
                return response()->json(['message' => 'Email tidak tersedia dari Google.'], 422);
            }

            // Buat user dari payload
            $googleUser = (object) [
                'id' => $payload['sub'] ?? $payload['email'],
                'name' => $payload['name'] ?? $payload['email'],
                'email' => $payload['email'],
                'avatar' => $payload['picture'] ?? null,
            ];

            $user = $this->findOrCreateUser($googleUser);

            $token = $user->createToken(
                'google-id-token',
                $this->abilitiesFor($user->role),
            )->plainTextToken;

            return response()->json([
                'message' => 'Login Google berhasil.',
                'user' => new \App\Domain\Auth\Resources\UserResource($user),
                'token' => $token,
                'token_type' => 'Bearer',
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal verifikasi token Google: ' . $e->getMessage()], 500);
        }
    }

    private function findOrCreateUser($googleUser): User
    {
        $email = $googleUser->email ?? $googleUser->getEmail();
        $name = $googleUser->name ?? $googleUser->getName() ?? $googleUser->getNickname() ?? 'Google User';
        $googleId = $googleUser->id ?? $googleUser->getId();
        $avatar = $googleUser->avatar ?? $googleUser->getAvatar();

        $user = User::where('email', $email)->first();

        if ($user) {
            // Update avatar jika belum ada, dan pastikan email_verified
            if (! $user->email_verified_at) {
                $user->forceFill(['email_verified_at' => now(), 'status' => UserStatus::Active->value])->save();
            }
            if ($avatar && ! $user->avatar_url) {
                $user->forceFill(['avatar_url' => $avatar])->save();
            }
            // Simpan google_id di onboarding_details jika belum ada
            if (! ($user->onboarding_details['google_id'] ?? null)) {
                $details = $user->onboarding_details ?? [];
                $details['google_id'] = $googleId;
                $user->forceFill(['onboarding_details' => $details])->save();
            }
            return $user;
        }

        // Buat user baru — role customer default, langsung verified karena dari Google
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'phone' => null,
            'password' => Hash::make(Str::random(32)),
            'role' => User::ROLE_CUSTOMER,
            'status' => UserStatus::Active->value,
            'email_verified_at' => now(),
            'phone_verified_at' => null,
            'avatar_url' => $avatar,
            'onboarding_details' => ['google_id' => $googleId, 'provider' => 'google'],
        ]);

        // Buat customer profile juga
        $user->customer()->create([
            'name' => $name,
            'phone' => $user->phone ?? '',
            'email' => $email,
        ]);

        return $user;
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
