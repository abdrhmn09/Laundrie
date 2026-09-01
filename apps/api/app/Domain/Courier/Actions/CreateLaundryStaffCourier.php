<?php

namespace App\Domain\Courier\Actions;

use App\Models\Courier;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CreateLaundryStaffCourier
{
    public function execute(User $user, array $data): Courier
    {
        if ($user->courierProfile()->exists()) {
            throw ValidationException::withMessages(['courier' => ['Anda sudah memiliki profil courier.']]);
        }

        // Must be Staff or Manager of a laundry per PRD §12.3
        $laundryId = $data['laundry_id'] ?? null;
        if (! $laundryId) {
            // Try to infer from staff membership
            $staff = $user->staffMemberships()->first();
            if ($staff) $laundryId = $staff->laundry_id;
            // Manager owns laundry
            if (! $laundryId && $user->ownedLaundry) $laundryId = $user->ownedLaundry->id;
        }

        if (! $laundryId) {
            throw ValidationException::withMessages(['laundry_id' => ['Anda belum terikat Staff/Manager pada laundry manapun. Lamar sebagai Staff + Courier terlebih dahulu.']]);
        }

        // Verify user is Staff or Manager of that laundry
        $isStaff = $user->staffMemberships()->where('laundry_id', $laundryId)->exists();
        $isManager = $user->ownedLaundry && $user->ownedLaundry->id === (int)$laundryId;
        if (! $isStaff && ! $isManager) {
            throw ValidationException::withMessages(['laundry_id' => ['Anda bukan Staff/Manager di laundry tersebut.']]);
        }

        return Courier::create([
            'user_id'      => $user->id,
            'laundry_id'   => $laundryId,
            'courier_type' => 'laundry_staff',
            'vehicle_type' => $data['vehicle_type'] ?? 'motor',
            'service_area' => $data['service_area'] ?? null,
            'payout_info'  => $data['payout_info'] ?? null,
            'status'       => 'PENDING',
        ]);
    }
}
