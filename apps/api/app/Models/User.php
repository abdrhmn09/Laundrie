<?php

namespace App\Models;

use App\Domain\Auth\Enums\UserRole;
use App\Domain\Auth\Enums\UserStatus;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'name',
    'email',
    'phone',
    'password',
    'role',
    'status',
    'avatar_url',
    'date_of_birth',
    'gender',
    'notification_preferences',
    'onboarding_details',
    'email_notifications',
    'whatsapp_notifications',
    'phone_verified_at',
    'email_verified_at',
    'last_login_at',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_CUSTOMER         = 'customer';
    public const ROLE_STAFF            = 'staff';
    public const ROLE_MANAGER          = 'manager';
    public const ROLE_COURIER          = 'courier';
    public const ROLE_OPERATIONS_ADMIN = 'operations_admin';
    public const ROLE_FINANCE_ADMIN    = 'finance_admin';
    public const ROLE_SUPER_ADMIN      = 'super_admin';
    public const ROLE_ADMIN            = 'admin';

    public const STATUS_ACTIVE               = 'active';
    public const STATUS_EMAIL_UNVERIFIED     = 'email_unverified';
    public const STATUS_PHONE_UNVERIFIED     = 'phone_unverified';
    public const STATUS_ONBOARDING           = 'onboarding';
    public const STATUS_PENDING_VERIFICATION = 'pending_verification';
    public const STATUS_SUSPENDED            = 'suspended';
    public const STATUS_CLOSED               = 'closed';

    protected function casts(): array
    {
        return [
            'email_verified_at'       => 'datetime',
            'phone_verified_at'       => 'datetime',
            'last_login_at'           => 'datetime',
            'date_of_birth'           => 'date',
            'email_notifications'     => 'boolean',
            'whatsapp_notifications'  => 'boolean',
            'notification_preferences' => 'array',
            'onboarding_details'       => 'array',
            'password'                => 'hashed',
        ];
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isEmailVerified(): bool
    {
        return ! is_null($this->email_verified_at);
    }

    public function hasRole(string|array $roles): bool
    {
        if (is_array($roles)) {
            return in_array($this->role, $roles, true);
        }

        return $this->role === $roles;
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, [
            self::ROLE_SUPER_ADMIN,
            self::ROLE_OPERATIONS_ADMIN,
            self::ROLE_FINANCE_ADMIN,
            self::ROLE_ADMIN,
        ], true);
    }
}