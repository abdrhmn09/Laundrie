<?php

namespace App\Domain\Order\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'laundry_id' => ['required', 'exists:laundries,id'],
            'pickup_address_id' => ['nullable', 'numeric'],
            'delivery_address_id' => ['nullable', 'numeric'],
            'scheduled_pickup_start' => ['required', 'date'],
            'scheduled_pickup_end' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.service_id' => ['required', 'exists:services,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.1'],
            'estimated_weight' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
