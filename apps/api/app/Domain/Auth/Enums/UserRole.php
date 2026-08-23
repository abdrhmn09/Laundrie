<?php

namespace App\Domain\Auth\Enums;

enum UserRole: string
{
    case Customer       = 'customer';
    case Staff          = 'staff';
    case Manager        = 'manager';
    case Courier        = 'courier';
    case OperationsAdmin = 'operations_admin';
    case FinanceAdmin   = 'finance_admin';
    case SuperAdmin     = 'super_admin';

    /** @deprecated Use SuperAdmin — kept for backward-compat */
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Customer        => 'Pelanggan',
            self::Staff           => 'Staf Laundry',
            self::Manager         => 'Manajer Laundry',
            self::Courier         => 'Kurir',
            self::OperationsAdmin => 'Admin Operasional',
            self::FinanceAdmin    => 'Admin Keuangan',
            self::SuperAdmin      => 'Super Admin',
            self::Admin           => 'Admin',
        };
    }

    public function isAdmin(): bool
    {
        return in_array($this, [self::OperationsAdmin, self::FinanceAdmin, self::SuperAdmin, self::Admin]);
    }
}