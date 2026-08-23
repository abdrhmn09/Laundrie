<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (User $user, string $token) {
            $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));

            return "{$frontendUrl}/reset-password?token={$token}&email={$user->getEmailForPasswordReset()}";
        });

        VerifyEmail::createUrlUsing(function (User $user) {
            $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));

            $temporarySignedUrl = URL::temporarySignedRoute(
                'verification.verify',
                Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
                [
                    'id' => $user->getKey(),
                    'hash' => sha1($user->getEmailForVerification()),
                ]
            );

            // Extract path & query parameters from signed URL to pass to frontend callback
            $parsedUrl = parse_url($temporarySignedUrl);
            $pathParts = explode('/', $parsedUrl['path']);
            $id = $pathParts[count($pathParts) - 2] ?? $user->getKey();
            $hash = $pathParts[count($pathParts) - 1] ?? sha1($user->getEmailForVerification());
            $query = $parsedUrl['query'] ?? '';

            return "{$frontendUrl}/auth/verify/{$id}/{$hash}?{$query}";
        });
    }
}
