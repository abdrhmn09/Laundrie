<?php

namespace App\Domain\Laundry\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Laundry */
class LaundryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'user_id'         => $this->user_id,
            'business_name'   => $this->business_name,
            'legal_name'      => $this->legal_name,
            'address_line'    => $this->address_line,
            'latitude'        => $this->latitude,
            'longitude'       => $this->longitude,
            'operating_hours' => $this->operating_hours,
            'capacity_config' => $this->capacity_config,
            'status'          => $this->status,
            'contact_phone'   => $this->contact_phone,
            'contact_email'   => $this->contact_email,
            'created_at'      => $this->created_at,
            'updated_at'      => $this->updated_at,
        ];
    }
}
