<?php

namespace App\Domain\Laundry\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\StaffApplication */
class StaffApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'staff_opening_id' => $this->staff_opening_id,
            'laundry_id'       => $this->laundry_id,
            'user_id'          => $this->user_id,
            'application_type' => $this->application_type,
            'message'          => $this->message,
            'status'           => $this->status,
            'reviewed_at'      => $this->reviewed_at,
            'reviewed_by'      => $this->reviewed_by,
            'opening'          => new StaffOpeningResource($this->whenLoaded('opening')),
            'laundry'          => $this->whenLoaded('laundry', fn () => [
                'id'            => $this->laundry->id,
                'business_name' => $this->laundry->business_name,
            ]),
            'applicant'        => $this->whenLoaded('applicant', fn () => [
                'id'    => $this->applicant->id,
                'name'  => $this->applicant->name,
                'email' => $this->applicant->email,
            ]),
            'created_at'       => $this->created_at,
        ];
    }
}
