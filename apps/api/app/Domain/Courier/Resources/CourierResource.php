<?php

namespace App\Domain\Courier\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Courier */
class CourierResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'user_id'      => $this->user_id,
            'laundry_id'   => $this->laundry_id,
            'courier_type' => $this->courier_type,
            'vehicle_type' => $this->vehicle_type,
            'service_area' => $this->service_area,
            'status'       => $this->status,
            'created_at'   => $this->created_at,
        ];
    }
}
