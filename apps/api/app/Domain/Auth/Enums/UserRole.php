<?php

namespace App\Domain\Auth\Enums;

enum UserRole: string
{
    case Customer = 'customer';
    case Staff = 'staff';
    case Courier = 'courier';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Customer => 'Pelanggan',
            self::Staff => 'Staf Laundry',
            self::Courier => 'Kurir',
            self::Admin => 'Admin',
        };
    }
}