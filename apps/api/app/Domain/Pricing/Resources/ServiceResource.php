<?php

namespace App\Domain\Pricing\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Service */
class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'laundry_id' => $this->laundry_id,
            'laundry' => $this->whenLoaded('laundry', fn () => ['id' => $this->laundry->id, 'business_name' => $this->laundry->business_name]),
            'name' => $this->name,
            'service_type' => $this->service_type,
            'pricing_model' => $this->pricing_model,
            'base_price' => $this->base_price,
            'price_per_unit' => $this->price_per_unit,
            'unit' => $this->unit,
            'minimum_charge' => $this->minimum_charge,
            'estimated_duration' => $this->estimated_duration,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'active_price' => $this->whenLoaded('activePrice'),
        ];
    }
}
