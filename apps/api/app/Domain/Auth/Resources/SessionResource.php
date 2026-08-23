<?php

namespace App\Domain\Auth\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Laravel\Sanctum\PersonalAccessToken;

/** @mixin PersonalAccessToken */
class SessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $currentToken = $request->user()->currentAccessToken();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'abilities' => $this->abilities,
            'last_used_at' => $this->last_used_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'is_current' => $currentToken && $currentToken->id === $this->id,
        ];
    }
}
