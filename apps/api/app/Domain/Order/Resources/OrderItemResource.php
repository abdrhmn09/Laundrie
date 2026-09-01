<?php

namespace App\Domain\Order\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\OrderItem */
class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'service_id' => $this->service_id,
            'service' => $this->whenLoaded('service', fn () => ['id' => $this->service->id, 'name' => $this->service->name]),
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'estimated_amount' => $this->estimated_amount,
            'final_amount' => $this->final_amount,
        ];
    }
}
