<?php

namespace App\Domain\Laundry\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\StaffOpening */
class StaffOpeningResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'laundry_id'  => $this->laundry_id,
            'laundry'     => $this->whenLoaded('laundry', fn () => [
                'id'            => $this->laundry->id,
                'business_name' => $this->laundry->business_name,
                'address_line'  => $this->laundry->address_line,
                'status'        => $this->laundry->status,
            ]),
            'title'       => $this->title,
            'description' => $this->description,
            'quota'       => $this->quota,
            'status'      => $this->status,
            'is_open'     => $this->isOpen(),
            'created_at'  => $this->created_at,
        ];
    }
}
