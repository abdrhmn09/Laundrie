<?php

namespace App\Domain\Auth\Http\Controllers;

use App\Domain\Auth\Actions\RegisterUser;
use App\Domain\Auth\Http\Requests\LoginRequest;
use App\Domain\Auth\Http\Requests\RegisterRequest;
use App\Domain\Auth\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use RuntimeException;
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

        return response()->json([
            'message' => 'Pendaftaran berhasil.',
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
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

        if (! $user->isActive()) {
            RateLimiter::hit($key, 60);
            throw ValidationException::withMessages([
                'email' => ['Akun Anda sedang tidak aktif.'],
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

    /**
     * Abilities (token permissions) per role. Abilities di sini adalah
     * penanda kasar untuk layanan token; otorisasi detail tetap lewat policy
     * per endpoint (Bagian 15 arsitektur).
     */
    private function abilitiesFor(string $role): array
    {
        return match ($role) {
            User::ROLE_ADMIN => ['*'],
            User::ROLE_STAFF => ['orders:read', 'orders:update', 'weighing:write', 'evidence:write'],
            User::ROLE_COURIER => ['orders:read', 'jobs:read', 'jobs:update'],
            default => ['orders:read', 'orders:write'],
        };
    }
}