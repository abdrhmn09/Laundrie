<?php

namespace App\Domain\Auth\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $avatar = $this->avatar_url;
        if ($avatar && ! str_starts_with($avatar, 'http://') && ! str_starts_with($avatar, 'https://')) {
            $avatar = asset('storage/' . ltrim($avatar, '/'));
        }

        // Load capability relations if not already loaded (PRD One Account, Multiple Capabilities)
        $this->loadMissing(['customer', 'ownedLaundry', 'staffMemberships.laundry', 'courierProfile.laundry', 'adminUser']);

        $capabilities = [
            'is_customer' => true,
            'is_manager' => $this->isManager(),
            'is_staff' => $this->isStaff(),
            'is_courier' => $this->isCourier(),
            'is_freelance_courier' => $this->isFreelanceCourier(),
            'is_laundry_staff_courier' => $this->isLaundryStaffCourier(),
            'is_admin' => $this->isAdmin(),
        ];

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'status' => $this->status,
            'avatar_url' => $avatar,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'gender' => $this->gender,
            'notification_preferences' => $this->notification_preferences,
            'onboarding_details' => $this->onboarding_details,
            'email_notifications' => $this->email_notifications,
            'whatsapp_notifications' => $this->whatsapp_notifications,
            'email_verified' => $this->isEmailVerified(),
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'phone_verified_at' => $this->phone_verified_at?->toISOString(),
            'last_login_at' => $this->last_login_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'capabilities' => $capabilities,
            'laundry' => $this->ownedLaundry ? [
                'id' => $this->ownedLaundry->id,
                'business_name' => $this->ownedLaundry->business_name,
                'status' => $this->ownedLaundry->status,
            ] : null,
            'staff' => $this->staffMemberships->first() ? [
                'id' => $this->staffMemberships->first()->id,
                'laundry_id' => $this->staffMemberships->first()->laundry_id,
                'laundry_name' => $this->staffMemberships->first()->laundry->business_name ?? null,
                'role' => $this->staffMemberships->first()->role,
                'status' => $this->staffMemberships->first()->status,
            ] : null,
            'courier' => $this->courierProfile ? [
                'id' => $this->courierProfile->id,
                'courier_type' => $this->courierProfile->courier_type,
                'laundry_id' => $this->courierProfile->laundry_id,
                'status' => $this->courierProfile->status,
            ] : null,
            'admin' => $this->adminUser ? [
                'role' => $this->adminUser->role,
            ] : null,
        ];
    }
}