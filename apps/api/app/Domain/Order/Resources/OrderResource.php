<?php

namespace App\Domain\Order\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Order */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'customer_id' => $this->customer_id,
            'laundry_id' => $this->laundry_id,
            'laundry' => $this->whenLoaded('laundry', fn () => ['id' => $this->laundry->id, 'business_name' => $this->laundry->business_name]),
            'pickup_address' => $this->whenLoaded('pickupAddress'),
            'delivery_address' => $this->whenLoaded('deliveryAddress'),
            'status' => $this->status,
            'estimated_weight' => $this->estimated_weight,
            'actual_weight' => $this->actual_weight,
            'estimated_total' => $this->estimated_total,
            'final_total' => $this->final_total,
            'currency' => $this->currency,
            'scheduled_pickup_start' => $this->scheduled_pickup_start,
            'scheduled_pickup_end' => $this->scheduled_pickup_end,
            'items' => \App\Domain\Order\Resources\OrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at,
        ];
    }
}
