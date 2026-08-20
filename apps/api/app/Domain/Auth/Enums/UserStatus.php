<?php

namespace App\Domain\Auth\Enums;

enum UserStatus: string
{
    case Active = 'active';
    case Suspended = 'suspended';
    case PendingVerification = 'pending_verification';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif',
            self::Suspended => 'Ditangguhkan',
            self::PendingVerification => 'Menunggu Verifikasi',
        };
    }
}