<?php

namespace App\Domain\Auth\Enums;

enum UserStatus: string
{
    case Active              = 'active';
    case EmailUnverified     = 'email_unverified';
    case PhoneUnverified     = 'phone_unverified';
    case Onboarding          = 'onboarding';
    case PendingVerification = 'pending_verification';
    case Suspended           = 'suspended';
    case Closed              = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Active              => 'Aktif',
            self::EmailUnverified     => 'Menunggu Verifikasi Email',
            self::PhoneUnverified     => 'Menunggu Verifikasi Telepon',
            self::Onboarding          => 'Onboarding',
            self::PendingVerification => 'Menunggu Verifikasi',
            self::Suspended           => 'Ditangguhkan',
            self::Closed              => 'Ditutup',
        };
    }

    public function canLogin(): bool
    {
        return $this === self::Active;
    }
}