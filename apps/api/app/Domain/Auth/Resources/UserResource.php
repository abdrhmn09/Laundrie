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
        ];
    }
}